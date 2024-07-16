<template>
    <div class="slice-worker">
        <input type="file" @change="handleFileChange" />
    </div>
</template>
<script lang="ts" setup>
import { AsyncQueue } from '../../classes/AsyncQueue';
import { MultiChannel } from '../../classes/MultiChannel';
import { WorkerHelper } from '../../classes/WorkerHelper';
import { asyncForEach } from '../../utils/common.util';
import { downloadFileByBlob } from '../../utils/file.util';

const handleFileChange = async (ev) => {
    console.log(ev.target.files[0], 'slice-worker.vue::13行');
    const file: File = ev.target.files[0];
    const chunkSize = 0.4 * 1024 * 1024;
    const totalChunk = Math.ceil(file.size / chunkSize);
    const chunkDataArr: Blob[] = [];

    // 创建N个worker
    const workerNum = navigator.hardwareConcurrency || 4;
    const workerTaskNum = Math.ceil(totalChunk / workerNum);
    const workerArr: number[][] = [];
    let _item: number[] = [];
    for (let i = 0; i < totalChunk; i++) {
        if (_item.length < workerTaskNum) {
            _item.push(i);
        } else {
            workerArr.push(_item);
            _item = [];
        }
    }
    if (_item.length !== 0) {
        workerArr.push(_item);
    }

    let allTasks: any[] = [];
    for (let i = 0; i < totalChunk; i++) {
        allTasks.push({
            index: i,
            start: i * chunkSize,
            end: Math.min((i + 1) * chunkSize, file.size),
        });
    }

    // const asyncQueue = new AsyncQueue(workerNum);
    // asyncQueue.addManyTask(allTasks, async (item) => {
    //     console.log(item, 'slice-worker.vue::46行');
    // });
    // asyncQueue.run();

    /**
     * 通道是每个通道建一个workerHelper，
     * 通过每个通道的workerHelper来执行任务
     * 所以通道提供一个run的能力，将通道的实例传递过去
     */
    const channel = new MultiChannel(workerNum, () => {
        return new WorkerHelper('/static/slice-helper.ts');
        // const workerHelper = new WorkerHelper('/static/slice-helper.ts');
        // return workerHelper;
        // return { run: async (workerHelper,callback) => {} };
        // return {
        //     run: async (task, callback, index) => {
        //         const { start, end } = task;
        //         let result = await workerHelper.postMessage({
        //             action: 'sliceFile',
        //             file: file,
        //             start,
        //             end,
        //         });
        //         return result;
        //     },
        // };
    });
    channel.addManyTasks(allTasks, async (workerHelper, taskData, index) => {
        const instance = workerHelper.channelInstance;
        console.log(workerHelper, taskData, index, 'slice-worker.vue::75行');
        const { start, end } = taskData;
        let result = await instance.postMessage({
            action: 'sliceFile',
            file: file,
            start,
            end,
        });
        // return result;
        chunkDataArr.push(result);
    });
    channel.finishCallback = () => {
        console.log('全部切割完毕', chunkDataArr, 'slice-worker.vue::70行');
        downloadFileByBlob(chunkDataArr, file.name);
        channel.clear();
    };
    channel.run();

    // const workerHelper = new WorkerHelper('/static/slice-helper.ts');
    // let result = await workerHelper.postMessage({
    //     action: 'sliceFile',
    //     file: file,
    //     start: 0,
    //     end: 1 * chunkSize,
    // });
    // console.log(result, 'slice-worker.vue::17行');

    // for (let i = 0; i < totalChunk; i++) {
    //     const chunkData = file.slice(i * chunkSize, (i + 1) * chunkSize);
    //     chunkDataArr.push(chunkData);
    // }
};
</script>
<style lang="scss" scoped></style>
