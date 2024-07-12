import { createRouter, createWebHashHistory } from 'vue-router';

export const router = createRouter({
    history: createWebHashHistory('/'),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('../pages/index/index.vue'),
        },
        {
            path: '/upload',
            name: 'upload',
            component: () => import('../pages/upload/upload.vue'),
        },
        {
            path: '/download',
            name: 'download',
            component: () => import('../pages/download/download.vue'),
        },
    ],
});
