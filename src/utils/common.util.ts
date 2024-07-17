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
    /**获取运行环境 */
    getEnv() {
        return process.env.NODE_ENV;
    },
    /**获取运行目录 */
    getRunDir() {
        return process.cwd();
    },
    /**等待 */
    async wait(duration) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(1);
            }, duration);
        });
    },
    /**解析ini文件,返回对象 */
    parseIniFile(data) {
        const regex = {
            section: /^\s*\s*([^]*)\s*\]\s*$/,
            param: /^\s*([\w.\-_]+)\s*=\s*(.*?)\s*$/,
            comment: /^\s*;.*$/,
        };
        const value: any = {};
        data = data.toString();
        const lines = data.split(/\r\n|\r|\n/);
        let section = null;
        lines.forEach(function (line) {
            if (regex.comment.test(line)) {
                return;
            } else if (regex.param.test(line)) {
                const match = line.match(regex.param);
                if (section) {
                    value[section][match[1]] = match[2];
                } else {
                    value[match[1]] = match[2];
                }
            } else if (regex.section.test(line)) {
                const match = line.match(regex.section);
                const _key = match[1].replace('[', '').replace(']', '');
                value[_key] = {};
                section = _key;
            } else if (line.length == 0 && section) {
                section = null;
            }
        });
        return value;
    },
    /**格式化日期 */
    fmtDate(date: string | number | Date, format = 'yyyy-MM-dd hh:mm:ss') {
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
    },
};
