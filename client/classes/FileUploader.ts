import axios from 'axios';
import { AsyncQueue } from '../utils/AsyncQueue';

export interface ICurrentUploadObj {
    chunkSize: number;
    file: null | File;
    fileName: string;
    totalChunk: number;
    finishedChunk: number;
    chunkPercentage: number;
    /**status 0 未上传，1上传中 2 已上传 */
    chunkStatus: { start: number; end: number; status: 0 | 1 | 2 }[];
    /**上传后远程的文件地址 */
    remoteFileUrl: string;
}

export class FileUploader {
    private currentUploadObj: ICurrentUploadObj = {
        chunkSize: 1024,
        file: null,
        fileName: '',
        totalChunk: 0,
        finishedChunk: 0,
        chunkPercentage: 0,
        chunkStatus: [],
        remoteFileUrl: '',
    };

    private splitChunkSize: number;
    private uploader: any;
    private defaultChunkSize = 0.4 * 1024 * 1024;
    private concurrentMax;
    private chunkUploadQueue;
    constructor(
        file: File,
        concurrentMax = 2,
        chunkSize: number = this.defaultChunkSize,
        uploader?
    ) {
        this.currentUploadObj.file = file;
        this.currentUploadObj.chunkSize = chunkSize;
        this.splitChunkSize = chunkSize;
        this.uploader = uploader || this._defaultUploader;
        this.concurrentMax = concurrentMax;
    }

    private async _defaultUploader(i) {
        const currentUploadObj = this.currentUploadObj;
        const blob = this.getRangeBufferByIndex(i) as Blob;
        const { fileName, totalChunk } = currentUploadObj;

        const formData = new FormData();
        formData.append('file', blob);

        const reqUrl = `${$env.baseUrl}/file/upload?fileName=${fileName}&currentChunkIndex=${i}&totalChunkNum=${totalChunk}`;
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
    private getRangeBufferByIndex(i) {
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

    /**使用异步队列，切块上传 */
    enqueue(chunkCallback?, finishCallback?) {
        this.chunkUploadQueue = new AsyncQueue(this.concurrentMax);
        this.chunkUploadQueue.finishCallback = () => {
            const _remoteUrl = `${$env.baseUrl}/file/upload-result?fileName=${this.currentUploadObj.fileName}`;
            this.currentUploadObj.remoteFileUrl = _remoteUrl;
            finishCallback && finishCallback(this.currentUploadObj);
        };
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

    start() {
        this.chunkUploadQueue.run();
    }
}
