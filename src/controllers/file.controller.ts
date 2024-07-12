import fs from 'fs';
import path from 'path';
import { combineFileByDebris, makeSureDirExist, writeFileByStream } from '../utils/file.util';
import { UPLOAD_DIR } from '../configs/const.config';
import { CommonUtil } from '../utils/common.util';

// 上传标识
const uploadFlags = {};
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
}
async function FileUpload(params: IFileUploadParams, ctx: IKoaContext) {
    const fieldName = 'file';
    const file = ctx.request.files[fieldName];

    const tempFilePath = file.filepath;
    const { fileName, totalChunkNum, currentChunkIndex } = params;
    const fileDir = path.join(UPLOAD_DIR, fileName);

    await makeSureDirExist(fileDir);

    await CommonUtil.wait(2000);

    const _localTempFilePath = path.resolve(fileDir, `${currentChunkIndex}.temp`);
    await writeFileByStream(tempFilePath, _localTempFilePath);
    if (!uploadFlags[fileName]) {
        uploadFlags[fileName] = new Set();
    }
    uploadFlags[fileName].add(_localTempFilePath);
    const isLastChunk = uploadFlags[fileName].size === +totalChunkNum;
    if (isLastChunk) {
        const filePath = path.join(UPLOAD_DIR, 'f' + fileName);
        const debrisPaths: string[] = [];
        for (let i = 0; i < totalChunkNum; i++) {
            debrisPaths.push(path.resolve(fileDir, `${i}.temp`));
        }
        await combineFileByDebris(debrisPaths, filePath);

        uploadFlags[fileName].clear();
        fs.rmdirSync(fileDir, { recursive: true });
        return { status: 200, msg: 'finished' };
    } else {
        return { status: 200, msg: 'next' };
    }
}

/**获取上传结果的图片地址 */
interface IFileGetUploadResultParams {
    /**文件名称 */
    fileName: string;
}
function FileGetUploadResult(params: IFileGetUploadResultParams, ctx: IKoaContext) {
    const { fileName } = params;
    const filePath = path.join(UPLOAD_DIR, `f${fileName}`);
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
    '/file/upload': FileUpload,
    '/file/download': FileDownload,
    '/file/upload-result': FileGetUploadResult,
};
