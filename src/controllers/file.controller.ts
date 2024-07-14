import fs from 'fs';
import path from 'path';
import { combineFileByDebris, makeSureDirExist, writeFileByStream } from '../utils/file.util';
import { UPLOAD_DIR } from '../configs/const.config';
import { CommonUtil } from '../utils/common.util';

// 上传标识
const uploadFlags = {};

export async function FileExist(params) {
    const { md5, ext } = params;
    let resultFilePath = path.join(UPLOAD_DIR, md5);
    resultFilePath += ext ? `.${ext}` : '';
    const isExist = fs.existsSync(resultFilePath);
    return {
        headers: {
            'Content-Length': isExist ? 1 : 0,
        },
    };
}

/**
 * 图片分片上传
 */
interface IFileUploadParams {
    /**文件名称 */
    fileName: string;
    /**总共分片数量 */
    totalChunkNum: number;
    /**当前分片索引，从0开始 */
    currentChunkIndex: number;
    /**文件md5值 */
    md5?: string;
    /**文件扩展名 */
    ext?: string;
}
async function FileUpload(params: IFileUploadParams, ctx: IKoaContext) {
    const fieldName = 'file';
    const file = ctx.request.files[fieldName];

    const tempFilePath = file.filepath;
    const { fileName, totalChunkNum, currentChunkIndex, md5, ext } = params;

    const resultName = md5 || fileName;
    const fileDir = path.join(UPLOAD_DIR, `temp_${resultName}`);

    await makeSureDirExist(fileDir);

    await CommonUtil.wait(2000);

    const _localTempFilePath = path.resolve(fileDir, `${currentChunkIndex}.temp`);
    await writeFileByStream(tempFilePath, _localTempFilePath);
    if (!uploadFlags[resultName]) {
        uploadFlags[resultName] = new Set();
    }
    uploadFlags[resultName].add(_localTempFilePath);
    const isLastChunk = uploadFlags[resultName].size === +totalChunkNum;
    if (isLastChunk) {
        const filePath = md5
            ? path.join(UPLOAD_DIR, `${md5}.${ext}`)
            : path.join(UPLOAD_DIR, fileName);
        const debrisPaths: string[] = [];
        for (let i = 0; i < totalChunkNum; i++) {
            debrisPaths.push(path.resolve(fileDir, `${i}.temp`));
        }
        await combineFileByDebris(debrisPaths, filePath);

        uploadFlags[resultName].clear();
        fs.rmdirSync(fileDir, { recursive: true });
        return {
            status: 200,
            msg: 'finished',
            data: {
                url: filePath.replace(process.cwd(), ''),
            },
        };
    } else {
        return { status: 200, msg: 'next', data: null };
    }
}

/**获取上传结果的图片地址 */
interface IFileGetUploadResultParams {
    /**文件名称 */
    fileName: string;
}
function FileGetUploadResult(params: IFileGetUploadResultParams, ctx: IKoaContext) {
    const { fileName } = params;
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
        ctx.body = fs.readFileSync(filePath);
    } else {
        ctx.status = 404;
    }
}

/**根据头部Range字段，下载片段，若无Range则下载全部 */
async function FileDownload(params: IKeyValueObject, ctx: IKoaContext) {
    const { fileName } = params;
    const filePath = path.resolve(UPLOAD_DIR, `${fileName}`);

    if (ctx.request.method === 'HEAD') {
        if (fs.existsSync(filePath)) {
            const { size } = fs.statSync(filePath);
            return {
                headers: {
                    'Content-Length': size,
                },
            };
        } else {
            return '404';
        }
    } else {
        const { range } = ctx.request.header;

        const parts = range.replace(/bytes=/, '').split('-');
        const partialStart = parts[0];
        const partialEnd = parts[1];

        const start = parseInt(partialStart, 10);
        const end = parseInt(partialEnd, 10);

        const file = fs.createReadStream(filePath, { start, end });
        ctx.status = 206;

        await CommonUtil.wait(2000);

        return {
            headers: { 'Content-Type': 'application/octet-stream' },
            body: file,
            statusCode: 206,
        };
    }
}

export const FileRoutes = {
    '/file/exist': FileExist,
    '/file/upload': FileUpload,
    '/file/download': FileDownload,
    '/file/upload-result': FileGetUploadResult,
};
