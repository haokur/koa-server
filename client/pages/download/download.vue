<template>
    <div class="download">
        <input type="text" v-model="fileName" />
        <el-button @click="downloadFileByUrl">开始分片下载</el-button>
    </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import { AsyncQueue } from '../../utils/AsyncQueue';

const ChunkSize = Math.floor(0.4 * 1024 * 1024);
const fileName = ref('f1708607957313.png');
const currentDownloadObj = reactive<{
    fileName: string;
    fileUrl: string;
    fileRemoteUrl: string;
    /**整个文件的大小 */
    totalFileSize: number;
    chunkSize: number;
    chunkRanges: {
        start: number;
        end: number;
        /**0未下载，1下载中，2下载已完成 */
        status: 0 | 1 | 2;
        index: number;
    }[];
    chunkRangeData: ArrayBuffer[];
}>({
    fileName: '',
    fileUrl: '',
    fileRemoteUrl: '',
    totalFileSize: 0,
    chunkSize: ChunkSize,
    chunkRanges: [],
    chunkRangeData: [],
});

const downloadFileByUrl = () => {
    if (!fileName.value) return;
    if (fileName.value !== currentDownloadObj.fileName) {
        Object.assign(currentDownloadObj, {
            fileName: fileName.value,
            fileRemoteUrl: '',
            totalFileSize: 0,
            chunkSize: ChunkSize,
            chunkRanges: [],
            chunkRangeData: [],
        });
    }

    const url = `${$env.baseUrl}/file/download?fileName=${fileName.value}`;

    downloadFile(url);
};

async function allDownloadCallback() {
    // 拼接下载后的数据
    const fileBufferData = currentDownloadObj.chunkRangeData.reduce(
        (prev: ArrayBuffer[], current: ArrayBuffer) => {
            return [...prev, current];
        },
        []
    );

    const blob = new Blob(fileBufferData);
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'downloaded_file.png';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
}

// 开始按段请求下载
const maxConcurrent = 2;
const conQueue = new AsyncQueue(maxConcurrent, true);
conQueue.finishCallback = allDownloadCallback;

async function setDownloadInfo(url) {
    // 先试用HEAD方式仅获取文件大小
    const response = await axios.head(url);
    const contentLength: any = response.headers['content-length'] || '0';
    const totalSize = parseInt(contentLength);
    currentDownloadObj.totalFileSize = totalSize;

    // 按size和chunkSize进行分段
    let prevEndSize = -1;
    let index = 0;
    while (prevEndSize < totalSize) {
        const startSizeIndex = prevEndSize + 1;
        const endSizeIndex = prevEndSize + currentDownloadObj.chunkSize;
        currentDownloadObj.chunkRanges.push({
            start: startSizeIndex,
            end: endSizeIndex,
            status: 0,
            index,
        });
        prevEndSize = endSizeIndex;
        index++;
    }
}

async function downloadFile(url) {
    if (url !== currentDownloadObj.fileUrl) {
        conQueue.clear();
        currentDownloadObj.fileUrl = url;
        await setDownloadInfo(url);
    }

    const queueCallback = async (taskItem) => {
        let { index, start, end } = taskItem;
        const chunk = await fetchChunk(url, start, end);
        currentDownloadObj.chunkRangeData[index] = chunk;
    };
    conQueue.addManyTask(currentDownloadObj.chunkRanges, queueCallback);
    conQueue.run();
}

// 按分段数据拼接
async function fetchChunk(url, start, end) {
    const response = await fetch(url, {
        headers: {
            Range: `bytes=${start}-${end}`,
        },
    });
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
}
</script>
<style lang="scss" scoped></style>
