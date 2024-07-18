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

export interface ITableModel {
    /**用户表 */
    user: IUser;
    /**github访问表 */
    github_viewer: IGithubViewer;
}
