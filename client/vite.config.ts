/// <reference types="vite/client" />

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { defineConfig } from 'vite';
import { EnvMap } from './env';

const Env = process.env.NODE_ENV || 'production';

export default defineConfig({
    root: __dirname,
    base: './',
    build: {
        outDir: './dist',
    },
    plugins: [vue(), vueJsx()],
    define: {
        $env: EnvMap[Env],
    },
});
