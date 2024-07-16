/**单个通道的状态 */
enum ChannelStatus {
    Free = 0,
    Running = 1,
    Finished = 2,
}

/**单个通道 */
interface IChannelItem {
    index: number;
    status: ChannelStatus;
    channelInstance: any;
}

/**单个任务的状态 */
enum TaskStatus {
    Wait = 0,
    Running = 1,
    Finished = 2,
}
/**单个任务 */
interface ITask {
    task: any;
    callback: (...args: any[]) => Promise<any>;
    status: TaskStatus;
    index: number;
}

/**多管道并发 */
export class MultiChannel {
    channels: IChannelItem[] = [];
    tasks: ITask[] = [];
    channelMaxNum = 0;
    channelInit: any;
    public finishCallback: any;
    private isPause = false; // 暂停状态

    constructor(channelMaxNum, channelInit) {
        this.channelMaxNum = channelMaxNum;
        this.channelInit = channelInit;
    }

    // 添加多个任务，在各个channel中，自动填充
    addManyTasks(tasks, callback) {
        this.tasks = tasks.map((task, index) => {
            return {
                task,
                callback,
                status: TaskStatus.Wait,
                index: index,
            };
        });
    }

    // 检查通道，是否可以再创建
    private checkChannel() {
        // 如果通道数已经到了上限，直接返回
        const channelLength = this.channels.length;
        if (channelLength >= this.channelMaxNum) return;
        // 如果通道数小于任务数，看是否能够再创建通道
        if (this.channels.length < this.tasks.length) {
            const availableChannelNum = Math.min(this.tasks.length, this.channelMaxNum);
            for (let i = this.channels.length; i < availableChannelNum; i++) {
                this.channels.push({
                    index: i,
                    status: ChannelStatus.Free,
                    channelInstance: this.channelInit(),
                });
            }
        }
        console.log(`共创建${this.channels.length}个通道`, 'MultiChannel.ts::41行');
    }

    private runTask() {
        if (this.isPause) return;
        this.checkChannel();
        // 如果任务执行全部执行完成，即所有的通道都为空闲，且任务为空，则返回
        if (
            !this.tasks.length &&
            this.channels.every((item) => item.status === ChannelStatus.Free)
        ) {
            this.finishCallback && this.finishCallback();
        }

        // 启用通道执行任务
        this.channels.forEach((channel) => {
            // 当这个渠道的状态为可用，则取出任务执行
            if (channel.status === ChannelStatus.Free && this.tasks.length) {
                channel.status = ChannelStatus.Running;

                const currentTask = this.tasks.shift() as ITask;
                const { task, callback, index } = currentTask;
                currentTask.status = TaskStatus.Running;

                callback(channel, task, index).then(() => {
                    channel.status = ChannelStatus.Free;
                    currentTask.status = TaskStatus.Finished;

                    this.runTask();
                });
            }
        });
    }

    // 开始执行
    run() {
        this.isPause = false;
        this.runTask();
    }

    // 暂停执行
    pause() {
        this.isPause = true;
    }

    // 清除
    clear() {
        this.isPause = true;
        this.tasks = [];
        this.channels = [];
    }
}
