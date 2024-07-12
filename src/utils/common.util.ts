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

export const CommonUtil = {
    /**等待 */
    async wait(duration) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(1);
            }, duration);
        });
    },
};
