export const EnvMap: { [key: string]: IEvnConfig } = {
    development: {
        title: '开发环境',
        baseUrl: 'http://localhost:3000',
    },
    test: {
        title: '测试环境',
        baseUrl: 'http://test-localhost:3000',
    },
    uat: {
        title: 'UAT环境',
        baseUrl: 'http://uat-localhost:3000',
    },
    production: {
        title: '生产环境',
        baseUrl: 'http://localhost:3000',
    },
};
