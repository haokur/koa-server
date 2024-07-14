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
