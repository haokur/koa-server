interface IEvnConfig {
    /**应用标题 */
    title: string;
    /**请求基础地址 */
    baseUrl: string;
    /**web-worker根目录 */
    workerBaseUrl: string;
}

/**vite使用define全局注入的变量 */
declare const $env: IEvnConfig;
