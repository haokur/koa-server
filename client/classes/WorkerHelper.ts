function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class WorkerHelper {
    resolves;
    worker: Worker;

    constructor(workUrl) {
        this.worker = new Worker(workUrl);

        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handlerError.bind(this);

        this.resolves = new Map();
    }

    handleMessage(ev) {
        const { _id, payload } = ev.data;
        if (this.resolves.has(_id)) {
            const resolve = this.resolves.get(_id);
            resolve(payload);
            this.resolves.delete(_id);
        }
    }

    handlerError(error) {
        console.log('webworker error', error);
    }

    postMessage(payload) {
        return new Promise((resolve) => {
            const _id = generateUniqueId();
            const _data = { _id, payload };
            this.worker.postMessage(_data);
            this.resolves.set(_id, resolve);
        });
    }
}
