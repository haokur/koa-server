export const EnvMap: { [key: string]: IEvnConfig } = {
    development: {
        NODE_ENV: 'development',
        title: '开发环境',
        baseUrl: 'http://localhost:8666',
        workerBaseUrl: 'public/workers',
        // baseUrl: 'http://106.53.114.178:8666',
    },
    test: {
        NODE_ENV: 'test',
        title: '测试环境',
        workerBaseUrl: 'workers',
        baseUrl: 'http://test-localhost:8666',
    },
    uat: {
        NODE_ENV: 'uat',
        title: 'UAT环境',
        workerBaseUrl: 'workers',
        baseUrl: 'http://uat-localhost:8666',
    },
    production: {
        NODE_ENV: 'production',
        title: '生产环境',
        baseUrl: 'https://api.haokur.com',
        workerBaseUrl: 'workers',
    },
};
