"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileMd5Value = getFileMd5Value;
exports.writeFileByStream = writeFileByStream;
exports.readFileByStream = readFileByStream;
exports.makeSureDirExist = makeSureDirExist;
exports.combineFileByDebris = combineFileByDebris;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const common_util_1 = require("./common.util");
// 获取文件的md5信息
async function getFileMd5Value(filePath) {
    const stream = fs_1.default.createReadStream(filePath);
    const hash = (0, crypto_1.createHash)('md5');
    return new Promise((resolve) => {
        stream.on('data', (chunk) => {
            hash.update(chunk, 'utf8');
        });
        stream.on('end', () => {
            const md5 = hash.digest('hex');
            resolve(md5);
        });
    });
}
/**创建文件、文件夹 */
async function mkdir(path) {
    return new Promise((resolve, reject) => {
        fs_1.default.mkdir(path, {}, (err, path) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(path);
            }
        });
    });
}
/**使用stream异步创建file */
async function writeFileByStream(readPath, writePath) {
    if (!fs_1.default.existsSync(readPath)) {
        throw '要读取的文件不存在';
    }
    return new Promise((resolve) => {
        const readStream = typeof readPath === 'string' ? fs_1.default.createReadStream(readPath) : readPath;
        const writeStream = typeof writePath === 'string' ? fs_1.default.createWriteStream(writePath) : writePath;
        readStream.pipe(writeStream);
        writeStream.on('finish', () => {
            resolve(writePath);
        });
    });
}
async function readFileByStream(filePath) {
    return new Promise((resolve, reject) => {
        // 创建可读流
        const readStream = fs_1.default.createReadStream(filePath);
        let fileContent = ''; // 用于缓存文件内容
        // 监听流的事件
        readStream.on('data', (chunk) => {
            fileContent += chunk; // 将每个数据块追加到文件内容缓存中
        });
        readStream.on('end', () => {
            resolve(fileContent);
        });
        readStream.on('error', (err) => {
            reject(err);
        });
    });
}
/**确保文件夹已存在 */
async function makeSureDirExist(dirPath) {
    return new Promise((resolve) => {
        if (!fs_1.default.existsSync(dirPath)) {
            mkdir(dirPath).then(resolve);
        }
        else {
            resolve();
        }
    });
}
/**按顺序拼接文件块 */
async function combineFileByDebris(debrisPaths, targetPath) {
    return new Promise((resolve) => {
        const writeStream = fs_1.default.createWriteStream(targetPath);
        writeStream.on('finish', () => {
            resolve({
                success: true,
                message: '文件拼接完成',
            });
        });
        (0, common_util_1.asyncForEach)(debrisPaths, async (path) => {
            const data = fs_1.default.readFileSync(path);
            writeStream.write(data);
        }).then(() => {
            writeStream.end();
        });
    });
}
