<template>
    <div class="upload">
        <input type="file" @change="handleFileChange" ref="inputRef" />
        <div class="demo-progress" v-if="controlVisible">
            <el-progress :percentage="currentUploadObj.chunkPercentage" />
        </div>
        <div class="steps">
            <el-button
                v-for="(_, index) in currentUploadObj.totalChunk"
                :key="index"
                type="primary"
                @click="sendFileDataBySplitIndex(index)"
            >
                上传片段{{ index + 1 }}
            </el-button>
        </div>

        <div class="upload-all" v-if="controlVisible">
            <el-button type="primary" @click="uploadAllIndex">全部片段上传</el-button>
            <el-button type="primary" @click="pauseUpload">中断上传</el-button>
            <el-button type="primary" @click="continueUpload">继续上传</el-button>
        </div>

        <img
            class="img"
            :src="currentUploadObj.remoteFileUrl"
            v-if="currentUploadObj.remoteFileUrl"
        />

        <div>
            {{ currentUploadObj }}
        </div>

        <div>
            <h3>上传组件</h3>
            <UploadControl v-model:imgList="imgList"></UploadControl>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import axios from 'axios';

import UploadControl from '../../components/UploadControl.vue';
import { AsyncQueue } from '../../utils/AsyncQueue';

const chunkSize = 0.4 * 1024 * 1024; // 400K
const inputRef: any = ref(null);
const imgList = ref([]);

// 当前上传的对象
const currentUploadObj = reactive<{
    chunkSize: number;
    file: null | HTMLInputElement;
    fileName: string;
    totalChunk: number;
    finishedChunk: number;
    chunkPercentage: number;
    /**status 0 未上传，1上传中 2 已上传 */
    chunkStatus: { start: number; end: number; status: 0 | 1 | 2 }[];
    /**上传后远程的文件地址 */
    remoteFileUrl: string;
}>({
    chunkSize,
    file: null,
    fileName: '',
    totalChunk: 0,
    finishedChunk: 0,
    chunkPercentage: 0,
    chunkStatus: [],
    remoteFileUrl: '',
});

const controlVisible = computed(() => {
    return !!currentUploadObj.totalChunk;
});

const handleFileChange = (ev) => {
    const file = ev.target.files[0];
    let totalChunk = Math.ceil(file.size / chunkSize);
    let chunkStatus = Array.from({ length: totalChunk }, (_, index) => {
        return { index: index, start: index * chunkSize, end: (index + 1) * chunkSize, status: 0 };
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
};

async function postFileData(i) {
    const blob = getRangeDataByIndex(i);
    let { fileName, totalChunk } = currentUploadObj;

    const formData = new FormData();
    formData.append('file', blob);

    await axios
        .post(
            `http://localhost:3000/file/upload?fileName=${fileName}&currentChunkIndex=${i}&totalChunkNum=${totalChunk}`,
            formData
        )
        .then((res) => {
            currentUploadObj.finishedChunk += 1;
            currentUploadObj.chunkPercentage = Math.floor(
                (currentUploadObj.finishedChunk / currentUploadObj.totalChunk) * 100
            );
            currentUploadObj.chunkStatus[i].status = 2;
            if (res.data.msg === 'finished') {
                currentUploadObj.remoteFileUrl = `http://localhost:3000/file/upload-result?fileName=${fileName}`;
            }
        });
}

// 根据索引获取数据段
const getRangeDataByIndex = (i) => {
    const file = inputRef.value.files[0];

    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);

    return blob;
};

// 最多并发数量，在上次未完成前，不能再发，避免一次太多请求
const ConcurrentMaxNum = 2;
const asyncQueue = new AsyncQueue(ConcurrentMaxNum, true);
const queueCallback = async (taskItem) => {
    await postFileData(taskItem.index);
};

const sendFileDataBySplitIndex = async (i) => {
    asyncQueue.addTask(currentUploadObj.chunkStatus[i], queueCallback);
    asyncQueue.run();
};

async function uploadAllIndex() {
    asyncQueue.addManyTask(currentUploadObj.chunkStatus, queueCallback);
    asyncQueue.run();
}

const pauseUpload = () => {
    asyncQueue.pause();
};

const continueUpload = () => {
    asyncQueue.run();
};
</script>
<style lang="scss" scoped>
.upload {
    padding: 40px;
}
.steps {
    margin-top: 20px;
}
.demo-progress {
    margin-top: 20px;
}
.upload-all {
    margin-top: 20px;
}
.img {
    margin-top: 20px;
    width: 300px;
    height: auto;
}
</style>
