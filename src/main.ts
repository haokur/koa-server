import Koa from 'koa';

const app = new Koa();

app.use(async (ctx) => {
    const obj = {
        a: 1,
    };
    const b = 1;
    console.log(obj, 'main.ts::9行');
    ctx.body = 'Hello,Koa!';
});

app.listen(3000, () => {
    console.log('server is run on http://localhost:3000');
});
