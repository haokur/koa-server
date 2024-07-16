const WorkerHandler = {
    sliceFile: async (payload) => {
        const { file, start, end } = payload;
        return file.slice(start, end);
    },
    sliceFileMany(payload) {
        const { file, chunks } = payload;
        // console.log(file, chunks, 'slice-helper.ts::8行');
        const chunkData: any[] = [];
        chunks.forEach((item) => {
            const { start, end } = item;
            chunkData.push(file.slice(start, end));
        });
        return chunkData;
    },
    sliceFileByTasks(payload) {
        const { file, allTasks } = payload;
        for (let i = 0; i < allTasks.length; i++) {
            const { start, end } = allTasks[i];
            file.slice(start, end);
        }
    },
};

self.onmessage = async function (event) {
    const { _id, payload } = event.data;
    const { action } = payload;
    let result: any = null;
    if (WorkerHandler[action]) {
        result = await WorkerHandler[action](payload);
    }
    self.postMessage({ _id, payload: result });
};
