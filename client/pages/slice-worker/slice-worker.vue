<template>
    <div class="mb20 intro">
        实测发现：
        <p>
            1、在小文件，少文件，使用同步处理的时间会更优于使用webworker处理，因为开启webworker会有损耗，通信也会有消耗
        </p>
        <p>2、使用webworker不会阻塞渲染进程，在进行slice时，不会阻碍刷新渲染</p>
        <p>3、当处理的量级上去之后，比如8个大文件要进行切割，使用webworker的优势才开始显现</p>
        <p>4、打开控制台，可以看到console.time打印的耗时</p>
    </div>
    <div class="slice-worker">
        <div class="mb20">
            <label for="">直接文件切割</label>
            <input type="file" @change="handleFileChange" />
        </div>
        <div class="mb20">
            <label for="">webworker文件切割-任务大数组</label>
            <input type="file" @change="handleFileChange2" />
        </div>
        <div class="mb20">
            <label for="">webworker文件切割-任务二维数组（减少webworker通信）</label>
            <input type="file" @change="handleFileChange3" />
        </div>
        <div class="mb20">
            <label for="">多文件同步slice</label>
            <input type="file" multiple @change="handleFileChange4" />
        </div>
        <div class="mb20">
            <label for="">多文件webworker-slice</label>
            <input type="file" multiple @change="handleFileChange5" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { MultiChannel } from '../../classes/MultiChannel';
import { WorkerHelper } from '../../classes/WorkerHelper';
import { downloadFileByBlob } from '../../utils/file.util';

const chunkSize = 0.4 * 1024 * 1024;
const getCommonInfo = (file) => {
    const totalChunk = Math.ceil(file.size / chunkSize);
    const workerNum = navigator.hardwareConcurrency || 4;
    let allTasks: any[] = [];
    for (let i = 0; i < totalChunk; i++) {
        allTasks.push({
            index: i,
            start: i * chunkSize,
            end: Math.min((i + 1) * chunkSize, file.size),
        });
    }
    return { allTasks, workerNum };
};

const handleFileChange = async (ev) => {
    const file: File = ev.target.files[0];
    const { allTasks } = getCommonInfo(file);
    console.time('普通切割耗时：');
    for (let i = 0; i < allTasks.length; i++) {
        let { start, end } = allTasks[i];
        file.slice(start, end);
    }
    console.timeEnd('普通切割耗时：');
};

const handleFileChange2 = async (ev) => {
    const file: File = ev.target.files[0];
    const { allTasks, workerNum } = getCommonInfo(file);
    const chunkDataArr: any[] = [];
    /**
     * 通道是每个通道建一个workerHelper，
     * 通过每个通道的workerHelper来执行任务
     * 在某些场景，并不优于单线程处理，因为数据传递也需要时间
     */
    console.time('webworker，任务不分组切割');
    const channel = new MultiChannel(workerNum, () => {
        return new WorkerHelper(`${$env.workerBaseUrl}/slice-helper.js`);
    })
        .onFinished(() => {
            console.timeEnd('webworker，任务不分组切割');
            downloadFileByBlob(chunkDataArr, file.name);
            channel.clear();
        })
        .addManyTasks(allTasks, async (workerHelper, taskData, index) => {
            const instance = workerHelper.channelInstance;
            const { start, end } = taskData;
            let result = await instance.postMessage({
                action: 'sliceFile',
                file: file,
                start,
                end,
            });
            chunkDataArr.push(result);
        })
        .run();
};
const handleFileChange3 = async (ev) => {
    const file: File = ev.target.files[0];
    const { allTasks, workerNum } = getCommonInfo(file);

    // 按线程数量，拆成线程数量个任务
    const chunksTasks: any[][] = [];
    let oneGroupChunks = Math.ceil(allTasks.length / workerNum);
    for (let i = 0; i < workerNum; i++) {
        let workerTaskItem: any[] = [];
        for (let j = 0; j < oneGroupChunks; j++) {
            let current = i * oneGroupChunks + j;
            if (allTasks[current]) {
                workerTaskItem.push(allTasks[current]);
            }
        }
        chunksTasks.push(workerTaskItem);
    }

    console.time('webworker任务分组切割');
    const workerChunkArr: any[] = [];
    const channel = new MultiChannel(workerNum, () => {
        return new WorkerHelper(`${$env.workerBaseUrl}/slice-helper.js`);
    })
        .onFinished(() => {
            console.timeEnd('webworker任务分组切割');
            let fileBufferArr = workerChunkArr.reduce((prev, current: any) => {
                return prev.concat(current);
            }, []);
            downloadFileByBlob(fileBufferArr, file.name);
            channel.clear();
        })
        .addManyTasks(chunksTasks, async (workerHelper, taskData, index) => {
            const instance = workerHelper.channelInstance;
            let result = await instance.postMessage({
                action: 'sliceFileMany',
                file: file,
                chunks: taskData,
            });
            workerChunkArr[index] = result;
        })
        .run();
};

const handleFileChange4 = async (ev) => {
    const files = ev.target.files;
    console.time('普通切割耗时：');
    Array.from(files).forEach((file: any) => {
        const { allTasks } = getCommonInfo(file);
        for (let i = 0; i < allTasks.length; i++) {
            let { start, end } = allTasks[i];
            file.slice(start, end);
        }
    });
    console.timeEnd('普通切割耗时：');
};

const handleFileChange5 = async (ev) => {
    const files = ev.target.files;
    const filesArr = Array.from(files);
    console.time('webworker，按文件分别分组切割');
    const channel = new MultiChannel(8, () => {
        return new WorkerHelper(`${$env.workerBaseUrl}/slice-helper.js`);
    })
        .onFinished(() => {
            console.timeEnd('webworker，按文件分别分组切割');
        })
        .addManyTasks(filesArr, async (workerHelper, file, index) => {
            const instance = workerHelper.channelInstance;
            const { allTasks } = getCommonInfo(file);
            let result = await instance.postMessage({
                action: 'sliceFileByTasks',
                file: file,
                allTasks,
            });
        })
        .run();
};
</script>
<style lang="scss" scoped>
.intro {
    padding: 10px;
    border: 1px dashed #e1e1e1;
}
</style>
