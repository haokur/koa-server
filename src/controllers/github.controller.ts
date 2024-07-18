import { RedisService } from '../services/redis.service';
import { SqlService } from '../services/sql.service';
import { CommonUtil } from '../utils/common.util';

const GithubViewerTableName = 'github_viewer';

async function GithubCreateTable() {
    const createResult = await SqlService.createTable({
        tableName: GithubViewerTableName,
        tableComment: 'github用户访问表',
        tableColumns: {
            username: 'varchar(255)|false|false|false|用户名',
            spm_id_from: 'varchar(255)|false|false|false|访问来源',
            ip: 'varchar(255)|false|false|false|访问IP',
            view_date: 'varchar(255)|false|false|false|访问日期',
        },
    });
    return createResult;
}

async function GithubViewerCount(params, ctx) {
    const headers = ctx.req.headers;
    const userAgent = headers['user-agent'];
    if (!userAgent.includes('github-camo')) return 'not github';

    const { username, spm_id_from = '' } = params;
    if (!username) return 'not github user';

    const realIp = headers['x-real-ip'];

    const today = CommonUtil.fmtDate(Date.now(), 'yyyy-MM-dd');

    // 尝试读缓存，60秒刷新一次
    const userRedisDataKey = `github_view_${username}_${spm_id_from}`;
    const cacheData = await RedisService.get(userRedisDataKey);
    let todayViewCount = 0;
    let totalViewCount = 0;
    if (cacheData) {
        todayViewCount = cacheData.todayViewCount;
        totalViewCount = cacheData.totalViewCount;
    } else {
        await SqlService.insert(GithubViewerTableName, {
            username,
            spm_id_from,
            ip: realIp,
            view_date: today,
        });
        todayViewCount = await SqlService.count(GithubViewerTableName, {
            username,
            spm_id_from,
            view_date: today,
        });
        totalViewCount = await SqlService.count(GithubViewerTableName, {
            username,
            spm_id_from,
        });
        RedisService.set(
            userRedisDataKey,
            {
                todayViewCount,
                totalViewCount,
            },
            60
        );
    }

    // 根据user和
    const svgContent = `<svg width="140" height="70" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="20" fill="#333" font-size="15">
                今日访问数 ${todayViewCount}
            </text>
            <text x="10" y="50" fill="#333" font-size="15">
                累计访问数 ${totalViewCount}
            </text>
        </svg>`;
    ctx.type = 'image/svg+xml';
    ctx.body = svgContent;
}

export const GithubRoutes = {
    // '/github/viewer-create': GithubCreateTable,
    '/github/viewer-count': GithubViewerCount,
};
