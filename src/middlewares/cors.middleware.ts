import Application from 'koa';

const AllowHeaders = ['X-token', 'Range'];
const AllowMethods = ['GET, POST, PUT, DELETE,OPTIONS'];

export async function CorsMiddle(ctx: Application.Context, next: any) {
    const origin = ctx.get('Origin');
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Allow-Headers', AllowHeaders.join(',')); // 允许的自定义头部字段
    ctx.set('Access-Control-Allow-Methods', AllowMethods.join(',')); // 允许的 HTTP 方法
    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
    } else {
        await next();
    }
}
