/**
 * 初始化服务器
 * 1.mysql数据库建表
 * 2.redis配置基础信息
 */

// migration
import { asyncForEach } from '../client/utils/common.util';
import { AllTables } from '../src/databases/tables.db';
import { SqlService } from '../src/services/sql.service';

async function migrateMysql() {
    await asyncForEach(Object.keys(AllTables), async (key) => {
        const config = AllTables[key];
        const createResult = await SqlService.createTable(config);
        if (createResult?.serverStatus === 2) {
            if (createResult?.warningCount === 0) {
                console.log(`${config.tableName}创建成功`);
            } else {
                console.log(`${config.tableName}已存在`);
            }
        }
    });
}

migrateMysql();
