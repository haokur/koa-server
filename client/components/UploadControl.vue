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
        <label :for="cptId" class="img-label" ref="multiUploadLabelRef">
            <slot>
                <div class="progress-loading">
                    <div class="progress-mask" v-loading="isLoading"></div>
                    <div class="progress-content">
                        <el-progress
                            v-if="progress"
                            type="circle"
                            :width="60"
                            :status="`${progress === 100 ? 'success' : ''}`"
                            :percentage="progress"
                        />
                    </div>
                </div>
            </slot>
        </label>
        <div class="img-list">
            <div class="img-item" v-for="(item, index) in imgList" :key="index">
                <img :src="item.imgUrl" class="img" />
            </div>
        </div>
    </div>
</template>
<script lang="tsx" setup>
import { PropType, computed, onMounted, ref } from 'vue';
import { getRandomStr } from '../utils/common.util';
import { FileUploader, ICurrentUploadObj } from '../classes/FileUploader';
import { MultiChannel } from '../classes/MultiChannel';

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
    /**并发几个文件 */
    concurrentFileNum: { type: Number, default: 2 },
    /**单个文件并发多少个分片 */
    fileConcurrentChunkNum: { type: Number, default: 2 },
    bizId: { type: String, default: '' },
});

const isLoading = ref(false);
const newImgList = ref<string[]>([]);
const fileList = ref<File[]>([]);
const progress = computed(() => {
    if (!fileList.value.length) return 0;
    return Math.floor((newImgList.value.length / fileList.value.length) * 100);
});

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

function handleFilesChange(ev: Event) {
    if (isLoading.value) return;
    isLoading.value = true;
    const inputFiles = (ev.target as HTMLInputElement).files;
    if (!inputFiles) return;
    const filesArr = Array.from(inputFiles);
    submitUpload(filesArr);
}

// 分片上传单个文件
async function uploadItem(fileItem: File) {
    return new Promise(async (resolve) => {
        const fileUploader = new FileUploader(fileItem, props.fileConcurrentChunkNum);
        await fileUploader.enqueue(null, (uploadObj: ICurrentUploadObj) => {
            let currentItem = { imgUrl: uploadObj.remoteFileUrl };
            resolve(currentItem);
        });
        fileUploader.start();
    });
}

const emits = defineEmits(['success', 'update:imgList']);
function submitUpload(fileArr: File[]) {
    fileList.value = fileArr;
    const ChannelQueue = new MultiChannel(props.fileConcurrentChunkNum);
    ChannelQueue.addManyTask(fileArr, async (queueItem) => {
        const uploadResult = await uploadItem(queueItem);
        emits('update:imgList', [...props.imgList, uploadResult]);
        emits('success', uploadResult);
        newImgList.value.push('');
    });
    ChannelQueue.onFinished(() => {
        setTimeout(() => {
            isLoading.value = false;
            newImgList.value = [];
            fileList.value = [];
        }, 2000);
    });
    // ChannelQueue.finishCallback = ;
    ChannelQueue.run();
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
.progress {
    &-mask {
        width: 100%;
        height: 100px;
    }
    &-content {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.6);
        z-index: 99999;
    }
}
</style>
