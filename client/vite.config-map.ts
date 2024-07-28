/// <reference types="vite/client" />

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { defineConfig } from 'vite';
import { EnvMap } from './env';

import copyPlugin from './vite-plugins/copy-files';

const Env = process.env.NODE_ENV || 'production';

export default defineConfig({
    root: __dirname,
    base: './',
    build: {
        outDir: './dist',
        copyPublicDir: true,
        sourcemap: true,
    },
    plugins: [
        vue(),
        vueJsx(),
        copyPlugin({
            from: 'client/dist/assets',
            to: '_sourcemaps/assets',
            ext: ['.map', '.js'],
        }),
    ],
    define: {
        $env: EnvMap[Env],
    },
});
