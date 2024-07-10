import Koa from 'koa';
import { useRoutes } from './routes/use-router';
import { CorsMiddle } from './middlewares/cors.middleware';

const app = new Koa();
const port = 3000;

app.use(CorsMiddle)
    .use(useRoutes)
    .listen(port, () => {
        console.log(`server is run on http://localhost:${port}`);
    });
