/**
 * 外部只需要知道几个值：当前上传进度，下载完成的目标地址
 * 两个方法：开始，暂停
 */
import { ref } from 'vue';
import { FileUploader, ICurrentUploadObj } from '../classes/FileUploader';

export function useUpload(maxConcurrent = 4, chunkSize = 0.4 * 1024 * 1024) {
    const progress = ref(0);
    const remoteUrl = ref('');
    let fileUploader: any = null;

    const initUpload = (file: File, finishCallback?) => {
        fileUploader = new FileUploader(file, maxConcurrent, chunkSize);
        fileUploader.enqueue(
            (uploadObj: ICurrentUploadObj) => {
                progress.value = uploadObj.chunkPercentage;
            },
            (uploadObj: ICurrentUploadObj) => {
                remoteUrl.value = uploadObj.remoteFileUrl;
                finishCallback && finishCallback();
            }
        );
    };

    const startUpload = () => {
        fileUploader.start();
    };

    const pauseUpload = () => {
        fileUploader.pause();
    };

    return { progress, remoteUrl, initUpload, startUpload, pauseUpload };
}
