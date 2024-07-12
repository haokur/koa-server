interface IKeyValueObject {
    [key: string]: any;
}

// Koa ctx 对象
interface IKoaContext {
    /**获取请求数据 */
    request: {
        /**请求文件相关 */
        files: any;
        /**请求方法 */
        method: 'OPTIONS' | 'HEAD' | 'GET' | 'POST' | 'PUT' | 'DELETE';
        /**请求地址 */
        url: string;
        /**请求头 */
        header: IKeyValueObject;
    };
    /**设置响应体 */
    body: any;
    /**设置状态 */
    status: number;
}
