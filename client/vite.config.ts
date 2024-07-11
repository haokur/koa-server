import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { defineConfig } from 'vite';

export default defineConfig({
    root: __dirname,
    build: {
        outDir: './dist',
    },
    plugins: [vue(), vueJsx()],
});
