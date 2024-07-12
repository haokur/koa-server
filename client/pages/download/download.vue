<template>
    <div class="download">
        <input type="text" v-model="fileName" />
        <el-button @click="downloadFileByUrl">开始分片下载</el-button>
    </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { asyncForEach } from '../../utils/common.util';
import axios from 'axios';

const ChunkSize = Math.floor(0.4 * 1024 * 1024);
const fileName = ref('f1708607957313.png');
const currentDownloadObj = reactive<{
    fileName: string;
    fileRemoteUrl: string;
    /**整个文件的大小 */
    totalFileSize: number;
    chunkSize: number;
    chunkRanges: {
        start: number;
        end: number;
        /**0未下载，1下载中，2下载已完成 */
        status: 0 | 1 | 2;
    }[];
    chunkRangeData: ArrayBuffer[];
}>({
    fileName: '',
    fileRemoteUrl: '',
    totalFileSize: 0,
    chunkSize: ChunkSize,
    chunkRanges: [],
    chunkRangeData: [],
});

const downloadFileByUrl = () => {
    if (!fileName.value) return;
    Object.assign(currentDownloadObj, {
        fileName: fileName.value,
        fileRemoteUrl: '',
        totalFileSize: 0,
        chunkSize: ChunkSize,
        chunkRanges: [],
        chunkRangeData: [],
    });

    const url = `http://localhost:3000/file/download?fileName=${fileName.value}`;

    downloadFile(url);
};

async function downloadFile(url) {
    // 先试用HEAD方式仅获取文件大小
    const response = await axios.head(url);
    const contentLength: any = response.headers['content-length'] || '0';
    const totalSize = parseInt(contentLength);
    currentDownloadObj.totalFileSize = totalSize;

    // 按size和chunkSize进行分段
    let prevEndSize = -1;
    while (prevEndSize < totalSize) {
        const startSizeIndex = prevEndSize + 1;
        const endSizeIndex = prevEndSize + currentDownloadObj.chunkSize;
        currentDownloadObj.chunkRanges.push({
            start: startSizeIndex,
            end: endSizeIndex,
            status: 0,
        });
        prevEndSize = endSizeIndex;
    }

    // 开始按段请求下载
    await asyncForEach(currentDownloadObj.chunkRanges, async (item, index) => {
        const chunk = await fetchChunk(url, item.start, item.end);
        currentDownloadObj.chunkRangeData[index] = chunk;
    });

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
