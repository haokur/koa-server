export const EnvMap: { [key: string]: IEvnConfig } = {
    development: {
        title: '开发环境',
        baseUrl: 'http://localhost:8666',
        workerBaseUrl:"public/workers",
        // baseUrl: 'http://106.53.114.178:8666',
    },
    test: {
        title: '测试环境',
        workerBaseUrl:"workers",
        baseUrl: 'http://test-localhost:8666',
    },
    uat: {
        title: 'UAT环境',
        workerBaseUrl:"workers",
        baseUrl: 'http://uat-localhost:8666',
    },
    production: {
        title: '生产环境',
        baseUrl: 'https://api.haokur.com',
        workerBaseUrl:"workers",
    },
};
