import { SqlService } from '../services/sql.service';

/**测试添加表 */
async function TestCreateTable() {
    const createResult = await SqlService.createTable({
        tableName: 'user',
        tableComment: '用户表',
        tableColumns: {
            username: 'varchar(255)|false|false|false|用户名',
            email: 'varchar(255)|false|false|false|用户邮箱',
        },
    });
    return createResult;
}

/**测试插入数据 */
// http://localhost:8666/test/table-insert?username=xxx&email=xx@qq.com
async function TestTableInsert(params) {
    const { username, email } = params;
    const createResult = await SqlService.insert('user', {
        username,
        email,
    });
    return createResult;
}

async function TestTableInsertMany() {
    const createResult = await SqlService.insertMany('user', [
        {
            username: 'abc',
            email: 'abc@qq.com',
        },
        {
            username: 'efg',
            email: 'efg@qq.com',
        },
    ]);
    return createResult;
}

/**测试软删除数据 */
async function TestTableDelete() {
    const result = await SqlService.delete('user', { username: 'xiaobing' });
    return result;
}

/**测试更改数据 */
async function TestTableUpdate() {
    const updateResult = await SqlService.update('user', {
        from: { username: '肖兵' },
        to: { username: 'abc' },
    });
    return updateResult;
}

/**测试查询数据 */
async function TestTableQuery() {
    const result = await SqlService.find(
        'user',
        { id: 1, username: '肖兵', email: '!=abc@qq.com' },
        null,
        ['username']
    );
    console.log(result[0]?.id, 'test.controller.ts::59行');

    const resultOne = await SqlService.first('user');
    console.log(resultOne?.id, 'test.controller.ts::61行');

    const count = await SqlService.count('user', { username: 'abc' });
    console.log(count, 'test.controller.ts::81行');

    const pageData = await SqlService.findByPage(
        'user',
        { username: 'abc' },
        { pageIndex: 1, pageSize: 4 },
        ['username', 'email']
    );
    console.log(pageData[0]?.id, 'test.controller.ts::84行');

    return result;
}

export const TestRoutes = {
    '/test/table-create': TestCreateTable,
    '/test/table-insert': TestTableInsert,
    '/test/table-insert-many': TestTableInsertMany,
    '/test/table-delete': TestTableDelete,
    '/test/table-update': TestTableUpdate,
    '/test/table-query': TestTableQuery,
};
