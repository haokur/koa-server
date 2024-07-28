import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

import { SqlService } from '../services/sql.service';
import path from 'path';

/**监听日志上报 */
async function HandleReportLog(params, ctx) {
    const { content, source } = params;
    SqlService.insert('reports', {
        source,
        content,
    });
    ctx.status = 200;
}

/**sourcemap解析 */
async function ParseSourcemap(params, ctx) {
    // * at V (https://haokur.github.io/koa-server/assets/error-report-BfGNqStP.js:1:1384)
    // error-report-BfGNqStP.js:1:1384
    let { bundle_path } = params;
    bundle_path = decodeURIComponent(bundle_path).trim().replace('(', '').replace(')', '');
    const bundleItems = bundle_path.split('/');
    const bundleName = bundleItems[bundleItems.length - 1];
    const [fileName, line, col] = bundleName.split(':');

    // 错误信息（示例，实际中应从错误对象中获取）
    const errorLineNumber = line;
    const errorColumnNumber = col;

    // 要加载的 Sourcemap 文件路径
    const sourcemapFilePath = path.resolve(process.cwd(), `_sourcemaps/assets/${fileName}.map`);

    const result = await new Promise((resolve, reject) => {
        fs.readFile(sourcemapFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error loading Sourcemap file: ${err.message}`);
                return;
            }

            console.log(SourceMapConsumer, 'log.controller.ts::41行');

            // 解析 Sourcemap 文件
            SourceMapConsumer.with(JSON.parse(data), null, (consumer) => {
                console.log(consumer, 'log.controller.ts::45行');
                // 映射错误位置到源代码位置
                const { source, line, column } = consumer.originalPositionFor({
                    line: +errorLineNumber,
                    column: +errorColumnNumber,
                });

                // 输出还原后的源代码位置
                console.log(`Error occurred in file: ${source}`);
                console.log(`Original position: line ${line}, column ${column}`);
                resolve({ source, line, column });
            }).catch((error) => {
                console.error(`Error processing Sourcemap: ${error.message}`);
            });
        });
    });
    return result;
}

async function QueryLogList(params, ctx) {
    const result = await SqlService.findByPage('reports');
    return { list: result };
}

export const LogRoutes = {
    '/log/report.png': HandleReportLog,
    '/log/query': QueryLogList,
    '/log/parse-sourcemap': ParseSourcemap,
};
