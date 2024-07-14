<template>
    <div class="upload">
        <input type="file" @change="handleFileChange" />
        <div class="demo-progress" v-if="controlVisible">
            <el-progress :percentage="progress" />
        </div>

        <div class="upload-all" v-if="controlVisible">
            <el-button type="primary" @click="startUpload">全部片段上传</el-button>
            <el-button type="primary" @click="pauseUpload">中断上传</el-button>
            <el-button type="primary" @click="startUpload">继续上传</el-button>
        </div>

        <img class="img" :src="remoteUrl" v-if="remoteUrl" />
        <div>
            <h3>上传组件</h3>
            <UploadControl v-model:imgList="imgList"></UploadControl>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

import UploadControl from '../../components/UploadControl.vue';
import { useUpload } from '../../hooks/upload.hook';

const imgList = ref([]);
const fileMd5Value = ref('');

// 最多并发数量，在上次未完成前，不能再发，避免一次太多请求
const ConcurrentMaxNum = 2;
const chunkSize = 0.4 * 1024 * 1024; // 400K
const { progress, remoteUrl, initUpload, pauseUpload, startUpload } = useUpload(
    ConcurrentMaxNum,
    chunkSize
);
const controlVisible = ref(false);
const handleFileChange = (ev) => {
    controlVisible.value = true;
    initUpload(ev.target.files[0], (res) => {
        console.log(res, 'upload.vue::73行');
    });
    // 使用类上传
    // const fileUploader = new FileUploader(ev.target.files[0]);
    // fileUploader.upload((remoteUrl) => {
    //     console.log(remoteUrl, 'upload.vue::47行');
    // });
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
