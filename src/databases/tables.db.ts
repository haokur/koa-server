/**表通用字段 */
export interface ITableCommonColumns {
    /**索引，自增 */
    id: number;
    /**软删除标识符 */
    is_delete: 0 | 1;
    /**首次创建时间 */
    create_at: string;
    /**更新时间 */
    update_at: string;
}

/**新增表的配置 */
interface ICreateTableItem<K extends keyof ITableModel> {
    /**表名 */
    tableName: K;
    /**表注释 */
    tableComment: string;
    /**表列：类型(长度)|不是null|是否是索引列|自动递增|注释|默认值*/
    tableColumns: Pick<ITableModel[K], Exclude<keyof ITableModel[K], keyof ITableCommonColumns>>;
}
type IAllTables = {
    [key in keyof ITableModel]: ICreateTableItem<key>;
};

/**用户表 */
interface IUser extends ITableCommonColumns {
    /**用户名 */
    username: string;
    /**用户邮箱 */
    email: string;
}

/**github访问表 */
interface IGithubViewer extends ITableCommonColumns {
    /**对应github的用户 */
    username: string;
    /**访问来源，比如主页，项目或者其他第三方链接 */
    spm_id_from: string;
    /**访问者的真实IP */
    ip: string;
    /**访问的日期（没有时分秒，用来统计当日访问量） */
    view_date: string;
}

/**埋点上报表 */
interface IReport extends ITableCommonColumns {
    /**埋点详细信息 */
    content: string;
    /**埋点来源 */
    source: string;
}

export interface ITableModel {
    /**用户表 */
    user: IUser;
    /**github访问表 */
    github_viewer: IGithubViewer;
    /**埋点上报 */
    reports: IReport;
}

export const AllTables: IAllTables = {
    user: {
        tableName: 'user',
        tableComment: '用户表',
        tableColumns: {
            username: 'varchar(255)|false|false|false|用户名',
            email: 'varchar(255)|false|false|false|用户邮箱',
        },
    },
    github_viewer: {
        tableName: 'github_viewer',
        tableComment: 'github用户访问表',
        tableColumns: {
            username: 'varchar(255)|false|false|false|用户名',
            spm_id_from: 'varchar(255)|false|false|false|访问来源',
            ip: 'varchar(255)|false|false|false|访问IP',
            view_date: 'varchar(255)|false|false|false|访问日期',
        },
    },
    reports: {
        tableName: 'reports',
        tableComment: '埋点上报表',
        tableColumns: {
            content: 'text(2000)|false|false|false|埋点详细信息',
            source: 'varchar(255)|false|false|false|埋点来源',
        },
    },
};
