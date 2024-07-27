import { OkPacket } from 'mysql';
import { RedisService } from './redis.service';
import { AtLeastOne, SqlService } from './sql.service';
import { CommonUtil } from '../utils/common.util';
import { ITableModel } from '../databases/tables.db';

const MysqlRedisPrefix = 'mysql_';
/**
 * 通用的请求服务 redis+mysql联动
 * 兼容优先从redis读取，若redis无，则从数据库读取，并且写入redis
 * 增改和删，清除对应表的所有redis数据
 */
export const QueryService = {
    // 获取单项的key
    _getRowRedisKey(tableName: string, condition = {}) {
        const conditionStr = Object.keys(condition)
            .sort()
            .map((key) => `${key}_${condition[key]}`)
            .join('_');
        const redisKey = `${MysqlRedisPrefix}${tableName}_${conditionStr}`;
        return redisKey;
    },
    /**删除表格相关的redis数据 */
    deleteAboutTableName(tableName: string) {
        CommonUtil.nextTick(() => {
            // 清除redis缓存的数据
            RedisService.delete(`${MysqlRedisPrefix}${tableName}*`);
        });
    },
    /**获取多条数据 */
    async find<T extends keyof ITableModel>(
        tableName: T,
        conditionObj?: Partial<ITableModel[T]>,
        limit?: number | string | null,
        filterFields?: (keyof ITableModel[T])[]
    ): Promise<ITableModel[T][] | undefined[]> {
        let result;
        let redisKey: string = tableName;
        const isTryRedis = !limit && !filterFields;
        // 优先查找redis中是否有数据(只做tableName和conditionObj的缓存，有limit和filterFields不处理)
        if (isTryRedis) {
            redisKey = this._getRowRedisKey(tableName, conditionObj);
            result = await RedisService.get(redisKey);
        }
        if (!result) {
            result = await SqlService.find(tableName, conditionObj, limit, filterFields);
            isTryRedis && RedisService.set(redisKey, result);
        }
        return result;
    },
    /**获取分页数据 */
    async findByPage<T extends keyof ITableModel>(
        tableName: T,
        conditionObj?: Partial<ITableModel[T]>,
        pageOption?: { pageIndex: number; pageSize: number },
        filterFields?: (keyof ITableModel[T])[]
    ): Promise<ITableModel[T][] | undefined[]> {
        let result;
        let redisKey: string = tableName;
        // 优先查找redis中是否有数据(只做tableName和conditionObj的缓存，有limit和filterFields不处理)
        const isTryRedis = !filterFields;
        if (isTryRedis) {
            redisKey = this._getRowRedisKey(tableName, {
                ...(conditionObj || {}),
                ...(pageOption || {}),
            });
            result = await RedisService.get(redisKey);
        }
        if (!result) {
            result = await SqlService.findByPage(tableName, conditionObj, pageOption, filterFields);
            isTryRedis && RedisService.set(redisKey, result);
        }
        return result;
    },
    /**获取单条数据 */
    async first<T extends keyof ITableModel>(
        tableName: T,
        conditionObj?: Partial<ITableModel[T]>
    ): Promise<ITableModel[T] | undefined> {
        let result;
        const redisKey = this._getRowRedisKey(tableName, conditionObj) + '_first';
        result = await RedisService.get(redisKey);
        if (!result) {
            result = await this.find(tableName, conditionObj, 1);
            if (result && result[0]) {
                RedisService.set(redisKey, result[0]);
            }
        }
        return result[0];
    },
    /**增加一项 */
    async insert<T extends keyof ITableModel>(
        tableName: T,
        data: Partial<ITableModel[T]>,
        withDefaultColumns = true
    ): Promise<OkPacket> {
        this.deleteAboutTableName(tableName);
        return SqlService.insert(tableName, data, withDefaultColumns);
    },
    /**增加多项 */
    async insertMany<T extends keyof ITableModel>(
        tableName: T,
        data: Partial<ITableModel[T]>[],
        withDefaultColumns = true
    ): Promise<OkPacket> {
        this.deleteAboutTableName(tableName);
        return SqlService.insertMany(tableName, data, withDefaultColumns);
    },
    /**删除一项 */
    async delete<T extends keyof ITableModel>(
        tableName: T,
        conditionObj: AtLeastOne<ITableModel[T]>
    ): Promise<OkPacket> {
        this.deleteAboutTableName(tableName);
        return SqlService.delete(tableName, conditionObj);
    },
    /**更新一项 */
    async update<T extends keyof ITableModel>(
        tableName: T,
        updateInfo: { from: AtLeastOne<ITableModel[T]>; to: AtLeastOne<ITableModel[T]> }
    ): Promise<OkPacket> {
        this.deleteAboutTableName(tableName);
        return SqlService.update(tableName, updateInfo);
    },
};
