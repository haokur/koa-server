import Koa from 'koa';

const app = new Koa();

app.use(async (ctx) => {
    const test = {
        a: 1,
    };
    const b = 1;
    console.log(b, 'main.ts::10行');
    console.log(test, 'main.ts::9行');
    ctx.body = 'Hello,Koa!';
});

app.listen(3000, () => {
    console.log('server is run on http://localhost:3000');
});
