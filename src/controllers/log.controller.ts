import { SqlService } from '../services/sql.service';

/**监听日志上报 */
async function HandleReportLog(params, ctx) {
    const { content, source } = params;
    SqlService.insert('reports', {
        source,
        content,
    });
    ctx.status = 200;
}

async function QueryLogList(params, ctx) {
    const result = await SqlService.findByPage('reports');
    return { list: result };
}

export const LogRoutes = {
    '/log/report.png': HandleReportLog,
    '/log/query': QueryLogList,
};
