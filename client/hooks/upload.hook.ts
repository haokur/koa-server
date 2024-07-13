/**
 * 外部只需要知道几个值：当前上传进度，下载完成的目标地址
 * 两个方法：开始，暂停
 */
import { ref } from 'vue';
import { AsyncQueue } from '../utils/AsyncQueue';
import axios from 'axios';

interface ICurrentUploadObj {
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

export function useUpload(maxConcurrent) {
    const progress = ref(0);
    const remoteUrl = ref('');

    const chunkSize = 0.4 * 1024 * 1024; // 400K
    // 当前上传的对象
    const currentUploadObj: ICurrentUploadObj = {
        chunkSize,
        file: null,
        fileName: '',
        totalChunk: 0,
        finishedChunk: 0,
        chunkPercentage: 0,
        chunkStatus: [],
        remoteFileUrl: '',
    };

    async function postFileData(i) {
        const blob = getRangeDataByIndex(i) as Blob;
        const { fileName, totalChunk } = currentUploadObj;

        const formData = new FormData();
        formData.append('file', blob);

        const reqUrl = `${$env.baseUrl}/file/upload?fileName=${fileName}&currentChunkIndex=${i}&totalChunkNum=${totalChunk}`;
        await axios.post(reqUrl, formData).then((res) => {
            currentUploadObj.finishedChunk += 1;
            const progressCount =
                (currentUploadObj.finishedChunk / currentUploadObj.totalChunk) * 100;
            currentUploadObj.chunkPercentage = Math.floor(progressCount);
            currentUploadObj.chunkStatus[i].status = 2;
            progress.value = currentUploadObj.finishedChunk / currentUploadObj.totalChunk;
            if (res.data.msg === 'finished') {
                const _remoteUrl = `${$env.baseUrl}/file/upload-result?fileName=${fileName}`;
                remoteUrl.value = _remoteUrl;
                currentUploadObj.remoteFileUrl = _remoteUrl;
                console.log(_remoteUrl, remoteUrl.value, 'upload.hook.ts::62行');
            }
        });
    }

    // 根据索引获取数据段
    const getRangeDataByIndex = (i) => {
        const file = currentUploadObj.file as File;
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);
        return blob;
    };

    // 最多并发数量，在上次未完成前，不能再发，避免一次太多请求
    const asyncQueue = new AsyncQueue(maxConcurrent, true);
    const queueCallback = async (taskItem) => {
        await postFileData(taskItem.index);
    };

    const initUpload = (file, finishCallback) => {
        const totalChunk = Math.ceil(file.size / chunkSize);
        const chunkStatus = Array.from({ length: totalChunk }, (_, index) => {
            return {
                index: index,
                start: index * chunkSize,
                end: (index + 1) * chunkSize,
                status: 0,
            };
        });
        Object.assign(currentUploadObj, {
            file,
            totalChunk,
            fileName: file.name,
            finishedChunk: 0,
            chunkPercentage: 0,
            chunkStatus,
            remoteFileUrl: '',
        });

        asyncQueue.finishCallback = finishCallback;
        asyncQueue.clear();
        asyncQueue.addManyTask(currentUploadObj.chunkStatus, queueCallback);
    };

    const startUpload = () => {
        asyncQueue.run();
    };

    const pauseUpload = () => {
        asyncQueue.pause();
    };

    return { progress, remoteUrl, initUpload, startUpload, pauseUpload };
}
