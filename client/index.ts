import { createApp } from 'vue';

import AppVue from './App.vue';
import { router } from './routes/routes';

const app = createApp(AppVue);
app.use(router);

import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import 'element-plus/dist/index.css';
import './themes/basic.scss';
import { handleErrorReport } from './services/error.service';
app.use(ElementPlus, {
    locale: zhCn,
});

// 捕获异常并上报
handleErrorReport(app);

app.mount('#app');
