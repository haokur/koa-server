import mysql, { Connection, OkPacket } from 'mysql';
import { KoaConfig } from './config.service';
import { CommonUtil } from '../utils/common.util';
import { ITableModel } from '../databases/tables.db';

export type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

interface ICreateTableConfig<T extends keyof ITableModel> {
    tableName: T;
    tableComment: string;
    tableColumns: Partial<ITableModel[T]>;
}

let connection: Connection;
let connectionWorking = false;
let pingInterval;

export const SqlService = {
    getDefaultColumns(type: 'insert' | 'update' | 'delete') {
        const now = CommonUtil.fmtDate(Date.now());
        const defaultColumns = { update_at: now };
        if (type === 'insert') {
            Object.assign(defaultColumns, {
                create_at: now,
            });
        } else if (type === 'delete') {
            Object.assign(defaultColumns, {
                is_delete: 1,
            });
        }
        return defaultColumns;
    },
    getConditionSqlStr(conditionObj = {}) {
        let conditionStr = '';
        Object.keys(conditionObj).forEach((key) => {
            let _value = conditionObj[key];
            if (conditionStr) {
                conditionStr += ' and ';
            }
            if (typeof _value === 'string') {
                // !=取非, =取等于 ~=取like
                if (_value.startsWith('!=')) {
                    _value = _value.replace('!=', '');
                    conditionStr += `${key} != "${_value}"`;
                } else if (_value.startsWith('~=')) {
                    _value = _value.replace('~=', '');
                    conditionStr += `${key} like "%${_value}%"`;
                } else {
                    _value = _value.replace('=', '');
                    conditionStr += `${key} = "${_value}"`;
                }
            } else if (typeof _value === 'number') {
                conditionStr += `${key}=${_value}`;
            }
        });
        return conditionStr;
    },
    getPlaceholderStr(keys: string[]): string[] {
        return [keys.join(','), keys.map(() => '?').join(',')];
    },
    async connect(): Promise<string> {
        return new Promise((resolve) => {
            if (connectionWorking) {
                return resolve('ok');
            }
            connection = mysql.createConnection({
                host: KoaConfig.MYSQL_HOST,
                port: Number(KoaConfig.MYSQL_PORT),
                user: KoaConfig.MYSQL_USER,
                password: KoaConfig.MYSQL_PASSWORD,
                database: KoaConfig.MYSQL_DATABASE,
            });

            // 一段时间,置空connection,使得重新连接
            clearInterval(pingInterval);
            pingInterval = setTimeout(() => {
                connectionWorking = false;
            }, 1800000);

            connection.on('error', () => {
                connectionWorking = false;
            });
            resolve('ok');
        });
    },
    query(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.connect().then(() => {
                connection?.query(sql, (err, result) => {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        // 数据库连接错误,重连
                        connectionWorking = false;
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });
    },
    createTable<T extends keyof ITableModel>(
        config: ICreateTableConfig<T>,
        withDefaultColumns = true
    ): Promise<OkPacket> {
        // "type(<长度>)|isNotNull|isIndexProp|autoIncrement|comment|defaultValue"
        const { tableName, tableComment, tableColumns } = config;
        const primaryKeys: string[] = [];
        const insertColumns = withDefaultColumns
            ? {
                  id: 'int(11)|true|true|true|ID',
                  ...tableColumns,
                  create_at: 'datetime|false|false|false|创建时间',
                  update_at: 'datetime|false|false|false|更新时间',
                  is_delete: 'tinyint(2)|false|false|false|删除软key|0',
              }
            : { ...tableColumns };
        let sql = `CREATE TABLE IF NOT EXISTS "${tableName}"(`;
        Object.keys(insertColumns).forEach((prop) => {
            const currentColVal = insertColumns[prop];
            let columnStr = `"${prop}"`;
            const [
                type,
                isNotNull = 'false',
                isIndexProp = 'false',
                autoIncrement = 'false',
                comment = prop,
                defaultVal,
            ] = currentColVal.split('|');
            columnStr += ` ${type}`;
            if (['text', 'varchar'].includes(type)) {
                columnStr += ` COLLATE utf8mb4_bin`;
            }
            if (isNotNull.includes('true')) {
                columnStr += ` NOT NULL`;
            }
            if (isIndexProp.includes('true')) {
                primaryKeys.push(prop);
            }
            if (autoIncrement.includes('true')) {
                columnStr += ` AUTO_INCREMENT`;
            }
            if (comment) {
                columnStr += ` COMMENT '${comment}'`;
            }
            if (defaultVal !== undefined) {
                columnStr += ` DEFAULT '${defaultVal}'`;
            }
            sql += `${columnStr},`;
        });
        const primaryValue = primaryKeys.map((key) => `"${key}"`).join(',');
        sql += `PRIMARY KEY (${primaryValue})) COMMENT='${tableComment}'`;
        sql = sql.replace(/"/g, '`');
        console.log('[CREATE TABLE SQL]', sql);
        return this.query(sql);
    },
    insert<T extends keyof ITableModel>(
        tableName: T,
        data: Partial<ITableModel[T]>,
        withDefaultColumns = true
    ): Promise<OkPacket> {
        const columnData = { ...data };
        if (withDefaultColumns) {
            Object.assign(columnData, this.getDefaultColumns('insert'));
        }
        const keys = Object.keys(columnData);
        const [keyStr, valueStr] = this.getPlaceholderStr(keys);

        const addSql = `INSERT INTO ${tableName}(${keyStr}) VALUES(${valueStr})`;
        const addSqlParams = keys.map((key) => columnData[key]);

        return new Promise((resolve, reject) => {
            this.connect().then(() => {
                connection?.query(addSql, addSqlParams, function (err, results) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return reject(err.message);
                    }
                    resolve(results);
                });
            });
        });
    },
    insertMany<T extends keyof ITableModel>(
        tableName: T,
        data: Partial<ITableModel[T]>[],
        withDefaultColumns = true
    ): Promise<OkPacket> {
        if (!data.length) {
            throw 'insertMany的data字段需为一个数组不能为空';
        }

        const keys = Object.keys(data[0]);

        const defaultKeys = ['create_at', 'update_at', 'is_delete'];
        const defaultValues = {};
        if (withDefaultColumns) {
            keys.push(...defaultKeys);
            const now = CommonUtil.fmtDate(Date.now());
            Object.assign(defaultValues, {
                create_at: now,
                update_at: now,
                is_delete: 0,
            });
        }

        const [keyStr] = this.getPlaceholderStr(keys);
        const addSql = `INSERT INTO ${tableName}(${keyStr}) VALUES ?`;

        const addSqlParams = data.map((item) => {
            return keys.map((key) => {
                const _value = item[key];
                const _type = typeof _value;
                if (withDefaultColumns && defaultKeys.includes(key)) {
                    return defaultValues[key];
                }
                if (['string', 'number'].includes(_type)) return _value;
                if (['object'].includes(_type)) return JSON.stringify(_value);
            });
        });

        console.log('[INSERT MANY SQL] - ', addSql, addSqlParams);

        return new Promise((resolve, reject) => {
            this.connect().then(() => {
                connection.query(addSql, [addSqlParams], function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        reject(err.message);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    },
    async find<T extends keyof ITableModel>(
        tableName: T,
        conditionObj?: Partial<ITableModel[T]>,
        limit?: number | string | null,
        filterFields?: (keyof ITableModel[T])[]
    ): Promise<ITableModel[T][] | undefined[]> {
        const selectFields = filterFields ? filterFields.join(',') || '*' : '*';
        let sql = `select ${selectFields} from ${tableName} `;
        const conditionStr = this.getConditionSqlStr(conditionObj);
        if (conditionStr) {
            sql += ` where ${conditionStr} and is_delete != 1`;
        } else {
            sql += ` where is_delete != 1`;
        }
        if (limit) {
            sql += ` ORDER BY create_at DESC limit ${limit}`;
        }

        console.log('[FIND SQL] - ', sql);
        const result = (await this.query(sql)) as ITableModel[T][];
        return result;
    },
    async findByPage<T extends keyof ITableModel>(
        tableName: T,
        conditionObj?: Partial<ITableModel[T]>,
        pageOption?: { pageIndex: number; pageSize: number },
        filterFields?: (keyof ITableModel[T])[]
    ): Promise<ITableModel[T][] | undefined[]> {
        const { pageIndex = 1, pageSize = 10 } = pageOption || {};
        const startIndex = (pageIndex - 1) * pageSize;
        const limitStr = ` ${startIndex},${pageSize}`;
        const result = await this.find(tableName, conditionObj, limitStr, filterFields);
        return result;
    },
    async first<T extends keyof ITableModel>(
        tableName: T,
        conditionObj?: Partial<ITableModel[T]>
    ): Promise<ITableModel[T] | undefined> {
        const rows = await this.find(tableName, conditionObj, 1);
        return rows[0];
    },
    async count<T extends keyof ITableModel>(
        tableName: T,
        conditionObj: Partial<ITableModel[T]>
    ): Promise<number> {
        const conditionStr = this.getConditionSqlStr(conditionObj);
        let countSql = `select count(1) as total from ${tableName} `;
        if (conditionStr) {
            countSql += ` where ${conditionStr} and is_delete != 1`;
        } else {
            countSql += ` where is_delete != 1`;
        }
        const result = await this.query(countSql);
        return result[0].total;
    },
    /**更新一条数据 */
    async update<T extends keyof ITableModel>(
        tableName: T,
        updateInfo: { from: AtLeastOne<ITableModel[T]>; to: AtLeastOne<ITableModel[T]> }
    ): Promise<OkPacket> {
        const { from, to } = updateInfo;
        if (!Object.keys(from).length) {
            throw '禁止update无条件全量更新';
        }
        const conditionStr = this.getConditionSqlStr(from);
        const now = CommonUtil.fmtDate(Date.now());
        const updateData = [...Object.keys(to), 'update_at']
            .filter((key) => key !== 'id')
            .map((key) => {
                if (key === 'update_at') return `${key}="${now}"`;
                return typeof to[key] === 'string' ? `${key}='${to[key]}'` : `${key}=${to[key]}`;
            })
            .join(',');
        const sql = `update ${tableName} set ${updateData} where ${conditionStr} `;
        console.log('[UPDATE SQL] - ', sql);
        const result = (await this.query(sql)) as Promise<OkPacket>;
        return result;
    },
    async delete<T extends keyof ITableModel>(
        tableName: T,
        conditionObj: AtLeastOne<ITableModel[T]>
    ): Promise<OkPacket> {
        const toObj = { is_delete: 1 } as AtLeastOne<ITableModel[T]>;
        return this.update(tableName, {
            from: conditionObj,
            to: toObj,
        });
    },
    end() {
        connectionWorking = false;
        connection.end();
    },
};
