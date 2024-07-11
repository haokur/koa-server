import fs from 'fs';
import path from 'path';
import { combineFileByDebris, makeSureDirExist, writeFileByStream } from '../utils/file.util';
import { UPLOAD_DIR } from '../configs/const.config';

// 上传标识
const uploadFlags = {};
/**
 * 图片分片上传
 */
async function FileUpload(params, ctx) {
    const fieldName = 'file';
    const file = ctx.request.files[fieldName];

    const tempFilePath = file.filepath;
    const { filename, totalChunkNum, currentChunkIndex } = params;
    const fileDir = path.join(UPLOAD_DIR, filename);

    await makeSureDirExist(fileDir);

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, 2000);
    });

    const _localTempFilePath = path.resolve(fileDir, `${currentChunkIndex}.temp`);
    await writeFileByStream(tempFilePath, _localTempFilePath);
    if (!uploadFlags[filename]) {
        uploadFlags[filename] = new Set();
    }
    uploadFlags[filename].add(_localTempFilePath);
    const isLastChunk = uploadFlags[filename].size === +totalChunkNum;
    if (isLastChunk) {
        const filePath = path.join(UPLOAD_DIR, 'f' + filename);
        const debrisPaths: string[] = [];
        for (let i = 0; i < totalChunkNum; i++) {
            debrisPaths.push(path.resolve(fileDir, `${i}.temp`));
        }
        await combineFileByDebris(debrisPaths, filePath);

        uploadFlags[filename].clear();
        fs.rmdirSync(fileDir, { recursive: true });
        return { status: 200, msg: 'finished' };
    } else {
        return { status: 200, msg: 'next' };
    }
}

/**获取上传结果的图片地址 */
function FileGetUploadResult(params, ctx) {
    const { fileName } = params;
    const filePath = path.join(UPLOAD_DIR, `f${fileName}`);
    console.log(fs.existsSync(filePath));
    if (fs.existsSync(filePath)) {
        ctx.body = fs.readFileSync(filePath);
    } else {
        ctx.status = 404;
    }
}

function FileDownload(params, ctx) {
    return '';
}

export const FileRoutes = {
    '/file/upload': FileUpload,
    '/file/download': FileDownload,
    '/file/upload-result': FileGetUploadResult,
};
