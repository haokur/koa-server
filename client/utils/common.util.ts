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

export function fmtDate(date: string | number | Date, format = 'yyyy-MM-dd hh:mm:ss') {
    if (!date) return '--';
    // 兼容部分ios "-" 转换错误
    if (typeof date === 'string' && !date.includes('T')) {
        date = date.replace(/-/g, '/');
    }
    if (typeof date === 'string' && /\d{13}/.test(date)) {
        date = Number(date);
    }
    const dateObj = new Date(date);
    const o = {
        'y+': dateObj.getFullYear(),
        'M+': dateObj.getMonth() + 1, //month
        'd+': dateObj.getDate(), //day
        'h+': dateObj.getHours(), //hour
        'm+': dateObj.getMinutes(), //minute
        's+': dateObj.getSeconds(), //second
        'q+': Math.floor((dateObj.getMonth() + 3) / 3), //quarter
        S: dateObj.getMilliseconds(), //millisecond
    };

    // 匹配到其他非年份的
    Object.keys(o).map((key) => {
        const _regex = new RegExp('(' + key + ')');
        const _result = _regex.exec(format);
        if (_result) {
            const _match = _result[0];
            const _value = `00${o[key]}`;
            // 从后往前匹配到 _match 所需的长度，算出起始位置（_value.length - _match.length），
            // 截取到_value的最后一位
            const _target = _value.substring(_value.length - _match.length, _value.length);
            format = format.replace(_match, _target);
        }
    });
    return format;
}

// 复制文本
export function copyText(val) {
    const input = document.createElement('input');
    input.value = val;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
}
