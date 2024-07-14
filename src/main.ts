import Koa from 'koa';
import KoaBody from 'koa-body';
import { useRoutes } from './routes/use-router';
import { CorsMiddle } from './middlewares/cors.middleware';

const app = new Koa();
const port = 8666;

const KoaBodyMiddleware = KoaBody({
    multipart: true,
    formLimit: '12mb',
    jsonLimit: '12mb',
    textLimit: '12mb',
});

app.use(CorsMiddle)
    .use(KoaBodyMiddleware)
    .use(useRoutes)
    .listen(port, () => {
        console.log(`server is run on http://localhost:${port}`);
    });
