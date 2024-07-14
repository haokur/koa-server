export const EnvMap: { [key: string]: IEvnConfig } = {
    development: {
        title: '开发环境',
        baseUrl: 'http://localhost:8666',
        // baseUrl: 'http://106.53.114.178:8666',
    },
    test: {
        title: '测试环境',
        baseUrl: 'http://test-localhost:8666',
    },
    uat: {
        title: 'UAT环境',
        baseUrl: 'http://uat-localhost:8666',
    },
    production: {
        title: '生产环境',
        baseUrl: 'https://api.haokur.com',
    },
};
