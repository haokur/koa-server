"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoutes = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_util_1 = require("../utils/file.util");
const const_config_1 = require("../configs/const.config");
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
    const fileDir = path_1.default.join(const_config_1.UPLOAD_DIR, filename);
    await (0, file_util_1.makeSureDirExist)(fileDir);
    const _localTempFilePath = path_1.default.resolve(fileDir, `${currentChunkIndex}.temp`);
    await (0, file_util_1.writeFileByStream)(tempFilePath, _localTempFilePath);
    if (!uploadFlags[filename]) {
        uploadFlags[filename] = new Set();
    }
    uploadFlags[filename].add(_localTempFilePath);
    const isLastChunk = uploadFlags[filename].size === +totalChunkNum;
    if (isLastChunk) {
        const filePath = path_1.default.join(const_config_1.UPLOAD_DIR, 'f' + filename);
        const debrisPaths = [];
        for (let i = 0; i < totalChunkNum; i++) {
            debrisPaths.push(path_1.default.resolve(fileDir, `${i}.temp`));
        }
        await (0, file_util_1.combineFileByDebris)(debrisPaths, filePath);
        uploadFlags[filename].clear();
        fs_1.default.rmdirSync(fileDir, { recursive: true });
        return 'file is finished';
    }
    else {
        return 'next';
    }
}
function FileDownload(params, ctx) {
    return '';
}
exports.FileRoutes = {
    '/file/upload': FileUpload,
    '/file/download': FileDownload,
};
