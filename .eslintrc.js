module.exports = {
    root: true,
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
    },
    env: {
        es6: true,
        browser: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],

    rules: {
        'no-alert': 2,
        semi: [2, 'always'], // 语句强制分号结尾
        'comma-dangle': [2, 'always-multiline'],
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
    plugins: ['@typescript-eslint'],
};
