import axios from 'axios';
// import { AsyncQueue } from './AsyncQueue';
import { getFileExt, getFileMD5 } from '../utils/file.util';
import { MultiChannel } from './MultiChannel';

export interface ICurrentUploadObj {
    chunkSize: number;
    file: null | File;
    fileName: string;
    fileExt: string;
    totalChunk: number;
    finishedChunk: number;
    chunkPercentage: number;
    /**status 0 未上传，1上传中 2 已上传 */
    chunkStatus: { start: number; end: number; status: 0 | 1 | 2 }[];
    /**上传后远程的文件地址 */
    remoteFileUrl: string;
    /**md5的值 */
    md5Value?: string;
}

export interface IUploaderMethod {
    /**
     * 实际上传接口请求方法
     * @param {number} i 请求片段索引
     * @returns {Promise<void>}
     */
    (i: number): Promise<void>;
}

const DefaultChunkSize = 0.4 * 1024 * 1024;
const DefaultMaxConcurrent = 2;
export class FileUploader {
    private currentUploadObj: ICurrentUploadObj = {
        chunkSize: 1024,
        file: null,
        fileName: '',
        fileExt: '',
        totalChunk: 0,
        finishedChunk: 0,
        chunkPercentage: 0,
        chunkStatus: [],
        remoteFileUrl: '',
    };

    private splitChunkSize: number;
    private uploader: IUploaderMethod;
    private concurrentMax: number;
    private chunkUploadQueue: MultiChannel;
    constructor(
        file: File,
        concurrentMax?,
        chunkSize?: number,
        uploader?: IUploaderMethod | undefined
    ) {
        this.currentUploadObj.file = file;
        this.currentUploadObj.fileName = file.name;
        this.currentUploadObj.fileExt = getFileExt(file.name);
        this.splitChunkSize = chunkSize || DefaultChunkSize;
        this.currentUploadObj.chunkSize = this.splitChunkSize;
        this.uploader = uploader || this._defaultUploader;
        this.concurrentMax = concurrentMax || DefaultMaxConcurrent;
        this.chunkUploadQueue = new MultiChannel(this.concurrentMax);
    }

    private async _defaultUploader(i: number) {
        const currentUploadObj = this.currentUploadObj;
        const blob = this.getRangeBufferByIndex(i);
        const { fileName, fileExt, totalChunk, md5Value } = currentUploadObj;

        const formData = new FormData();
        formData.append('file', blob);

        let reqUrl = `${$env.baseUrl}/file/upload?fileName=${fileName}&currentChunkIndex=${i}&totalChunkNum=${totalChunk}`;
        if (md5Value) {
            reqUrl += `&md5=${md5Value}&ext=${fileExt}`;
        }
        await axios.post(reqUrl, formData).then(() => {
            currentUploadObj.finishedChunk += 1;
            let progressCount =
                (currentUploadObj.finishedChunk / currentUploadObj.totalChunk) * 100;
            progressCount = Math.floor(progressCount);
            currentUploadObj.chunkPercentage = progressCount;
            currentUploadObj.chunkStatus[i].status = 2;
        });
    }

    /**根据splitChunkSize切开的，取第i块 */
    private getRangeBufferByIndex(i: number) {
        const file = this.currentUploadObj.file as File;
        const start = i * this.splitChunkSize;
        const end = Math.min(start + this.splitChunkSize, file.size);
        const blob = file.slice(start, end);
        return blob;
    }

    /**将文件切开 */
    private splitFile2Chunks() {
        const file = this.currentUploadObj.file as File;
        const chunkSize = this.splitChunkSize;
        const totalChunk = Math.ceil(file.size / chunkSize);
        const chunkStatus = Array.from({ length: totalChunk }, (_, index) => {
            return {
                index: index,
                start: index * chunkSize,
                end: (index + 1) * chunkSize,
                status: 0,
            };
        });
        Object.assign(this.currentUploadObj, {
            file,
            totalChunk,
            fileName: file.name,
            finishedChunk: 0,
            chunkPercentage: 0,
            chunkStatus,
            remoteFileUrl: '',
        });
        return chunkStatus;
    }

    /**以md5的方式，检查文件是否已经存在，已经存在则不需重复上传 */
    private async isFileExist(): Promise<boolean> {
        const md5Value = await getFileMD5(this.currentUploadObj.file as File);
        this.currentUploadObj.md5Value = md5Value;
        const result = await axios.head(
            `${$env.baseUrl}/file/exist?md5=${md5Value}&ext=${this.currentUploadObj.fileExt}`
        );
        const size: string = (result.headers['content-length'] || '0') as string;
        return parseInt(size) > 0;
    }

    /**使用异步队列，切块上传 */
    async enqueue(chunkCallback?, finishCallback?) {
        // 获取当前文件的md5值，如果服务器存在该文件，则队列置空，直接返回文件
        const isFileExist = await this.isFileExist();

        // this.chunkUploadQueue.finishCallback = () => {
        //     const { md5Value, fileName, fileExt } = this.currentUploadObj;
        //     const remoteFileName = md5Value ? `${md5Value}.${fileExt}` : fileName;
        //     const remoteFileUrl = `${$env.baseUrl}/file/upload-result?fileName=${remoteFileName}`;
        //     this.currentUploadObj.remoteFileUrl = remoteFileUrl;
        //     finishCallback && finishCallback(this.currentUploadObj);
        // };
        this.chunkUploadQueue.onFinished(() => {
            const { md5Value, fileName, fileExt } = this.currentUploadObj;
            const remoteFileName = md5Value ? `${md5Value}.${fileExt}` : fileName;
            const remoteFileUrl = `${$env.baseUrl}/file/upload-result?fileName=${remoteFileName}`;
            this.currentUploadObj.remoteFileUrl = remoteFileUrl;
            finishCallback && finishCallback(this.currentUploadObj);
        });

        if (isFileExist) return;

        const chunkStatus = this.splitFile2Chunks();
        this.chunkUploadQueue.addManyTask(chunkStatus, async (taskItem) => {
            const { index } = taskItem;
            await this.uploader(index);
            chunkCallback && chunkCallback(this.currentUploadObj);
        });
    }

    pause() {
        this.chunkUploadQueue.pause();
    }

    async start() {
        this.chunkUploadQueue.run();
    }
}
