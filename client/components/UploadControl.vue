<template>
    <div class="upload-wrap">
        <input
            class="input"
            :id="cptId"
            type="file"
            multiple
            :disabled="isLoading"
            @change="handleFilesChange"
        />
        <label v-loading="isLoading" :for="cptId" class="img-label" ref="multiUploadLabelRef">
            <slot></slot>
        </label>
        <div class="img-list">
            <div class="img-item" v-for="(item, index) in imgList" :key="index">
                <img :src="item.imgUrl" class="img" />
            </div>
        </div>
    </div>
</template>
<script lang="tsx" setup>
import { PropType, onMounted, ref } from 'vue';
import { getRandomStr } from '../utils/common.util';
import { useUpload } from '../hooks/upload.hook';

interface IImgItem {
    imgUrl: string;
}
const props = defineProps({
    imgList: {
        type: Array as PropType<IImgItem[]>,
        default() {
            return [];
        },
    },
    bizId: { type: String, default: '' },
});

const isLoading = ref(false);

const cptId = ref('');
onMounted(() => {
    cptId.value = 'cpt_' + getRandomStr(8);
});

// 供外部调用点击事件=>选择文件
const multiUploadLabelRef = ref();
function chooseFile() {
    multiUploadLabelRef.value.click();
}
defineExpose({ chooseFile });

function handleFilesChange(ev) {
    if (isLoading.value) return;
    isLoading.value = true;
    let files = Array.from(ev.target.files);
    submitUpload(files);
}

const emits = defineEmits(['success', 'update:imgList']);
function submitUpload(fileList) {
    Promise.all(fileList.map((item) => uploadItem(item)))
        .then((res) => {
            emits('update:imgList', res);
            emits('success', res);
            isLoading.value = false;
            console.log('全部列表回调', res, props.imgList, 'UploadControl.vue::65行');
        })
        .catch((err) => {
            console.log(err, 'MultiUpload.vue::23行');
        });
}

const { progress, remoteUrl, initUpload, startUpload, pauseUpload } = useUpload(2);

// 上传图片
function uploadItem(fileItem) {
    return new Promise((resolve) => {
        initUpload(fileItem, () => {
            resolve({
                imgUrl: remoteUrl.value,
                originName: fileItem.name,
            });
        });
        startUpload();
    });
}
</script>

<style lang="scss" scoped>
.upload-wrap {
    display: flex;
    align-items: flex-start;

    .input {
        position: fixed;
        left: -1000px;
        top: -1000px;
    }
}

.img {
    &-label {
        display: inline-block;
        width: 100px;
        height: 100px;
        border: 1px solid #e1e1e1;
        border-radius: 8px;
        overflow: hidden;
        position: relative;

        &:before,
        &:after {
            position: absolute;
            content: '';
            left: 50%;
            top: 50%;
            background-color: #e1e1e1;
            border-radius: 1px;
            transform: translate(-50%, -50%);
        }

        &:before {
            width: 40px;
            height: 2px;
        }

        &:after {
            width: 2px;
            height: 40px;
        }
    }

    &-list {
        display: flex;
        align-items: flex-start;
    }

    &-item {
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
        margin-left: 8px;
        background-color: #f5f5f5;

        .img {
            max-width: 100%;
            max-height: 100%;
        }
    }
}
</style>
