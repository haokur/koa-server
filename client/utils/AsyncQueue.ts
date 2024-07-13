/**
 * 有序并发队列
 * 入队有序，返回结果无序（按索引自行排序）
 * 这里只负责维护队列执行，单个任务的成功回调，
 * 因为需要穿插暂停新增重新运行任务，并不主动告知使用者整个队列的完成
 * 使用者通过finishCallback挂载成功回调的方法
 *
 * 整体思路：
 * 维护一个全部任务的队列，一个正在运行中的任务队列
 * 每次从全部队列中拿出可以并发执行的任务数组，然后一一启动，推入正在进行的任务队列
 * 进行中的任务队列中，有一个完成了，就再次重复上一步的过程
 *
 *  */
/**整个队列状态 */
enum QueueStatus {
    Wait = 0,
    Running = 1,
    Finished = 2,
}

/**单个任务的状态 */
enum TaskStatus {
    Wait = 0,
    Running = 1,
    Finished = 2,
}

interface ITaskItem {
    task: any;
    callback: (task: any) => Promise<any>;
    status: TaskStatus;
}

export class AsyncQueue {
    /**最大并发执行数 */
    private queueMax = 1;
    /**所有任务的队列 */
    private allTaskQueue: ITaskItem[] = [];

    /**队列状态，0 未开始/暂停，1进行中，2已全部完成 */
    private queueStatus: QueueStatus = QueueStatus.Wait;
    /**是否忽略跳过相同的task，浅比较 */
    private ignoreEqualTask = false;

    /**队列任务全部执行完成时方法绑定 */
    public finishCallback;

    /**
     * @param queueMax 最大并发执行数
     * @param ignoreEqualTask 是否忽略跳过相同的task，浅比较
     */
    constructor(queueMax: number, ignoreEqualTask = false) {
        this.queueMax = queueMax;
        this.ignoreEqualTask = ignoreEqualTask;
    }

    /**获取是否整个队列都执行完成 */
    get isDone() {
        return this.queueStatus === QueueStatus.Finished;
    }

    /**获取当前队列状态 */
    getQueueStatus() {
        return this.queueStatus;
    }

    /**
     * 添加单个任务
     * task可以是数字，字符串，对象等各种数据
     *  */
    addTask(task, callback, status: TaskStatus = TaskStatus.Wait) {
        if (this.ignoreEqualTask && this.allTaskQueue.some((item) => item.task === task)) {
            return;
        }
        this.allTaskQueue.push({
            task,
            callback,
            status,
        });
    }

    /**一次添加多个任务 */
    addManyTask(taskList, callback) {
        taskList.forEach((task) => {
            this.addTask(task, callback);
        });
    }

    /**获取可以运行的任务，包括正在运行的，和即将推入的任务 */
    private getWorkQueue() {
        let workQueue: ITaskItem[] = this.allTaskQueue.filter((item) => {
            return item.status === TaskStatus.Running;
        });
        // 如果当前工作队列小于最大可用数量，则添加新的任务进来
        const availableNum = this.queueMax - workQueue.length;
        if (availableNum > 0) {
            const waitQueue = this.allTaskQueue.filter((item) => {
                return item.status === TaskStatus.Wait;
            });
            workQueue = [...workQueue, ...waitQueue.slice(0, availableNum)];
        }
        return workQueue;
    }

    /**清除任务队列 */
    clear() {
        this.allTaskQueue = [];
        this.queueStatus = QueueStatus.Wait;
    }

    /**
     * 暂停任务队列
     * 只能暂停未开始的，不能中断已经开始的任务
     *  */
    pause() {
        this.queueStatus = QueueStatus.Wait;
    }

    /**启动任务 */
    run() {
        this.queueStatus = QueueStatus.Running;
        this.runTask();
    }

    /**开启运行任务 */
    private async runTask() {
        if (this.queueStatus !== QueueStatus.Running) return;
        const workQueueList = this.getWorkQueue();
        if (workQueueList.length === 0) {
            this.queueStatus = QueueStatus.Finished;
            this.finishCallback && this.finishCallback();
            return;
        }
        // 筛选出待执行的执行
        workQueueList
            .filter((queueItem) => queueItem.status === 0)
            .forEach((queueItem) => {
                queueItem.status = TaskStatus.Running;
                const { task, callback } = queueItem;
                callback(task).then(() => {
                    queueItem.status = TaskStatus.Finished;
                    this.runTask();
                });
            });
    }
}
