import Koa from 'koa';

const app = new Koa();

app.use(async (ctx) => {
    ctx.body = 'Hello,Koa!';
});

app.listen(3000, () => {
    console.log('server is run on http://localhost:3000');
});
