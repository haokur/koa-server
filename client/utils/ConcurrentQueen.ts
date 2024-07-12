/**
 * 有序并发队列
 * 入队有序，返回结果无序（按索引自行排序）
 *  */
interface ITask {
    task: any;
    index: number;
}
export class ConcurrentQueen {
    allQueen = [];
    allTaskQueen: ITask[] = []; // 基于allQueen映射的task队列
    totalTask = 0;
    queenMax = 1;
    callback = async (task: any) => null;

    workQueenSet;
    canRun = true;

    constructor(allQueen, queenMax, callback) {
        this.allQueen = allQueen;
        this.allTaskQueen = allQueen.map(this.configureTask);
        this.totalTask = this.allTaskQueen.length;
        this.queenMax = queenMax;
        this.callback = callback;
        this.workQueenSet = new Set();
    }

    private configureTask(item, index) {
        return { task: item, index };
    }

    add(task, callback?) {
        const _index = this.totalTask + 1;
        this.allTaskQueen.push(this.configureTask(task, _index));
        if (callback) {
            this.callback = callback;
        }
    }

    stop() {
        this.canRun = false;
    }

    async start() {
        this.canRun = true;
        await this.run();
    }

    run() {
        return new Promise<void>((resolve, reject) => {
            function _runQueen() {
                if (!this.canRun) {
                    return reject('中断执行');
                }
                // 当工作队列和所有任务队列为空时，返回结果
                if (this.workQueenSet.size === 0 && this.allTaskQueen.length === 0) {
                    return resolve();
                }
                const canDoNewTaskNum = this.queenMax - this.workQueenSet.size;
                const newTasks = this.allTaskQueen.splice(0, canDoNewTaskNum);
                if (newTasks.length) {
                    newTasks.forEach((task) => {
                        this.workQueenSet.add(task);
                        this.callback(task).then(() => {
                            this.workQueenSet.delete(task);
                            _runQueen.apply(this);
                        });
                    });
                }
            }

            _runQueen.apply(this);
        });
    }
}
