export async function asyncForEach(arr, callback) {
    const length = arr.length;
    const O = Object(arr);
    let k = 0;
    while (k < length) {
        if (k in O) {
            const kValue = O[k];
            await callback(kValue, k, O);
        }
        k++;
    }
}

export function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomStr(len) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    let KEY = '';
    const charsLength = chars.length;
    for (let i = 0; i < len; i += 1) {
        KEY += chars[getRandomNum(0, charsLength)];
    }
    return KEY;
}

/**
 * 入队有序，出队结果无序
 * 有序的异步队列，一次可并发queenMax个任务
 * 哪个任务先执行完，先被踢出队列
 * 即做到了任务排队有序，但是出队无序，按响应时间有不同
 * 而后面入队的任务是有序的
 * */
export async function concurrentRun(allQueen, queenMax, callback) {
    return new Promise((resolve) => {
        // 先把他组装一下成对象
        const allQueenTasks = allQueen.map((item, index) => ({ index, task: item }));

        // 执行任务队列,执行时添加，完成时删除
        const workQueenSet = new Set();

        function runQueen() {
            // 当工作队列和所有任务队列为空时，返回结果
            if (workQueenSet.size === 0 && allQueenTasks.length === 0) {
                return resolve(true);
            }
            const canDoNewTaskNum = queenMax - workQueenSet.size;
            const newTasks = allQueenTasks.splice(0, canDoNewTaskNum);
            if (newTasks.length) {
                newTasks.forEach((task) => {
                    workQueenSet.add(task);
                    callback(task).then(() => {
                        workQueenSet.delete(task);
                        runQueen();
                    });
                });
            }
        }

        runQueen();
    });
}
