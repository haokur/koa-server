import fs from 'fs';
import path from 'path';
import { CommonUtil } from '../utils/common.util';

interface IKoaConfig {
    /**环境 */
    ENV: 'development' | 'test' | 'uat' | 'production';
    /**KOA应用端口号 */
    KOA_PORT: string;
    
    /**mysql域名 */
    MYSQL_HOST: string;
    /**mysql端口 */
    MYSQL_PORT: string;
    /**mysql用户名 */
    MYSQL_USER: string;
    /**mysql密码 */
    MYSQL_PASSWORD: string;
    /**mysql数据库名 */
    MYSQL_DATABASE: string;

    /**redis链接 */
    REDIS_LINK: string;
}

let initialized = false;
const KoaConfigObj = {} as IKoaConfig;

export const KoaConfig: IKoaConfig = new Proxy(KoaConfigObj, {
    get(target, prop, receiver) {
        if (!initialized) {
            const env = CommonUtil.getEnv() || 'development';
            const runDir = CommonUtil.getRunDir();
            const iniPath = path.resolve(runDir, `.env/.env.${env}.ini`);
            const iniFileContent = fs.readFileSync(iniPath);
            const iniResult = CommonUtil.parseIniFile(iniFileContent);
            for (const attr in iniResult) {
                Reflect.set(target, attr, iniResult[attr]);
            }
            initialized = true;
        }
        return Reflect.get(target, prop, receiver);
    },
});

// 若需要一开始就访问KoaConfig的值，则可以考虑以下代码自动触发一次get
// KoaConfig.MYSQL_HOST;
