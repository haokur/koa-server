import Koa from 'koa';
import KoaBody from 'koa-body';
import { useRoutes, useWsRoutes } from './routes/use-router';
import { CorsMiddle } from './middlewares/cors.middleware';
import { KoaConfig } from './services/config.service';

import KoaWebsocket from 'koa-websocket';

// const app = new Koa();
const app = KoaWebsocket(new Koa());
const port = KoaConfig.KOA_PORT;

const KoaBodyMiddleware = KoaBody({
    multipart: true,
    formLimit: '12mb',
    jsonLimit: '12mb',
    textLimit: '12mb',
});

// websocket路由注册
app.ws.use(useWsRoutes);

app.use(CorsMiddle)
    .use(KoaBodyMiddleware)
    .use(useRoutes)
    .listen(port, () => {
        console.log(`server is run on http://localhost:${port}`);
    });
