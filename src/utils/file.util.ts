import fs from 'fs';
import path from 'path';

import { createHash, Hash } from 'crypto';
import { asyncForEach } from './common.util';

const ProcessRunDir = process.cwd();

// 获取文件的md5信息
export async function getFileMd5Value(filePath: string): Promise<string> {
    const stream = fs.createReadStream(filePath);
    const hash: Hash = createHash('md5');
    return new Promise((resolve) => {
        stream.on('data', (chunk: string) => {
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
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(path, {}, (err, path) => {
            if (err) {
                reject(err);
            } else {
                resolve(path);
            }
        });
    });
}

/**使用stream异步创建file */
export async function writeFileByStream(readPath, writePath) {
    if (!fs.existsSync(readPath)) {
        throw '要读取的文件不存在';
    }
    return new Promise<void>((resolve) => {
        const readStream = typeof readPath === 'string' ? fs.createReadStream(readPath) : readPath;
        const writeStream =
            typeof writePath === 'string' ? fs.createWriteStream(writePath) : writePath;
        readStream.pipe(writeStream);

        writeStream.on('finish', () => {
            resolve(writePath);
        });
    });
}

export async function readFileByStream(filePath) {
    return new Promise((resolve, reject) => {
        // 创建可读流
        const readStream = fs.createReadStream(filePath);
        let fileContent = ''; // 用于缓存文件内容

        // 监听流的事件
        readStream.on('data', (chunk: string) => {
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
export async function makeSureDirExist(dirPath) {
    return new Promise<void>((resolve) => {
        if (!fs.existsSync(dirPath)) {
            mkdir(dirPath).then(resolve).catch(resolve);
        } else {
            resolve();
        }
    });
}

/**按顺序拼接文件块 */
export async function combineFileByDebris(debrisPaths: string[], targetPath: string) {
    return new Promise((resolve) => {
        const writeStream = fs.createWriteStream(targetPath);
        writeStream.on('finish', () => {
            resolve({
                success: true,
                message: '文件拼接完成',
            });
        });
        asyncForEach(debrisPaths, async (path) => {
            const data = fs.readFileSync(path);
            writeStream.write(data);
        }).then(() => {
            writeStream.end();
        });
    });
}

/**安全可写的目录 */
const SafePaths = [`${ProcessRunDir}/_temp`];

/**安全拼接路径避免超出可控文件夹范围 */
export function safePathJoin(...args) {
    const joinResult = path.join(...args);
    if (!SafePaths.some((item) => joinResult.startsWith(item))) {
        throw `目录超出可操作范围:${joinResult}`;
    }
    return joinResult;
}

export function safePathResolve(...args) {
    const resolveResult = path.resolve(...args);
    if (!SafePaths.some((item) => resolveResult.startsWith(item))) {
        throw `目录超出可操作范围:${resolveResult}`;
    }
    return resolveResult;
}
