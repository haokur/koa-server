import * as redis from 'redis';
import { KoaConfig } from './config.service';
import { asyncForEach } from '../utils/common.util';
let RedisClient;

interface ISetItem {
    /**redis的key */
    key: string;
    /**redis的值 */
    value: number | string | object;
    /**单项过期时间 */
    expireSecond?: number;
}

export const RedisService = {
    async connect(redisLink = KoaConfig.REDIS_LINK) {
        if (RedisClient) return RedisClient;
        RedisClient = await redis
            .createClient({ url: redisLink })
            .on('error', (err) => console.log('[REDIS ERROR] ', err))
            .connect();
    },
    async getAllKeys() {
        await this.connect();
        return await RedisClient.keys('*');
    },
    async getAll(): Promise<IKeyValueObject> {
        await this.connect();
        const keys = await RedisClient.keys('*');
        const results = {};
        await asyncForEach(keys, async (key) => {
            const _result = await this.get(key);
            Object.assign(results, { [key]: _result });
        });
        return results;
    },
    async get(key: string) {
        await this.connect();
        let cacheValue = await RedisClient.get(key);
        if (!cacheValue) return;
        const isObjectStr = cacheValue.startsWith('{') || cacheValue.startsWith('[');
        if (cacheValue && isObjectStr) {
            try {
                cacheValue = JSON.parse(cacheValue);
            } catch (error) {
                console.log('[REDIS cache value parse error]', error);
            }
        }
        return cacheValue;
    },
    async set(key: string, value: number | string | object, expireSecond?: number) {
        if (key.includes('*')) throw 'key中禁止带*号';
        await this.connect();
        // 不管键是否存在，都直接设置，没有是新增，有是更新
        const options = { NX: false };
        if (expireSecond) {
            Object.assign(options, { EX: expireSecond });
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        await RedisClient.set(key, value, options, function (err) {
            if (err) throw err;
        });
    },
    async setMany(data: ISetItem[], commonExpireSecond?: number) {
        await this.connect();
        const multi = RedisClient.multi();
        const options = { NX: false };
        if (commonExpireSecond) {
            Object.assign(options, { EX: commonExpireSecond });
        }
        data.forEach((item) => {
            const itemOptions = { ...options };
            if (item.expireSecond) {
                Object.assign(itemOptions, { EX: item.expireSecond });
            }
            multi.set(item.key, item.value, itemOptions);
        });
        multi.exec();
    },
    async delete(key) {
        if (key === '*') throw '删除所有请使用clearAll方法';
        await this.connect();
        if (key.includes('*')) {
            const keys = await RedisClient.keys(key);
            await asyncForEach(keys, async (key) => {
                await RedisClient.del(key);
            });
        } else {
            await RedisClient.del(key);
        }
    },
    async clearAll() {
        await this.connect();
        const keys = await RedisClient.keys('*');
        await asyncForEach(keys, async (key) => {
            await RedisClient.del(key);
        });
    },
    async disconnect() {
        RedisClient && (await RedisClient.disconnect());
    },
};
