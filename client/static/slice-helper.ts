const WorkerHandler = {
    sliceFile: async (payload) => {
        const { file, start, end } = payload;
        console.log('切割文件', file, payload, 'slice-helper.ts::3行');
        return file.slice(start, end);
    },
};

self.onmessage = async function (event) {
    const { _id, payload } = event.data;
    const { action } = payload;
    console.log('worker onmessage接收到信息:', action, _id, payload);
    let result: any = null;
    if (WorkerHandler[action]) {
        result = await WorkerHandler[action](payload);
    }
    console.log(result, 'slice-helper.ts::17行');
    self.postMessage({ _id, payload: result });
};
