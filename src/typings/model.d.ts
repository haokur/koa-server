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

export interface ITableModel {
    /**用户表 */
    user: IUser;
}
