import Application from 'koa';

export async function CorsMiddle(ctx: Application.Context, next: any) {
    const origin = ctx.get('Origin');
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Allow-Headers', 'X-token'); // 允许的自定义头部字段
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,OPTIONS'); // 允许的 HTTP 方法
    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
    } else {
        await next();
    }
}
