import routes from './routes';
import wsRoute from './ws.routes';

export const useRoutes = async (ctx: any) => {
    const { request: req } = ctx;
    const [url, query = ''] = req.url.split('?');
    // 解析参数
    const queryObj: IKeyValueObject = {};
    // 1.拼接get请求参数
    query.split('&').forEach((item: string) => {
        const [key, value] = item.split('=');
        if (key) {
            queryObj[key] = decodeURIComponent(value);
            if (['pageIndex', 'pageSize'].includes(key)) {
                queryObj[key] = parseInt(queryObj[key]);
            }
        }
    });
    // 2.如果post有字符串数据,添加进去
    if (req.body && typeof req.body === 'string') {
        const typeOfReqBody = typeof req.body;
        if (typeOfReqBody === 'string') {
            try {
                req.body = JSON.parse(req.body);
            } catch (error) {
                console.log(error, 'main.ts::112行');
            }
        } else if (typeof typeOfReqBody === 'object') {
            Object.assign(queryObj, req.body);
        }
    }

    // 3.匹配handler，响应操作返回数据
    const routeHandler: any = routes[url];
    if (url && routeHandler && typeof routeHandler === 'function') {
        console.log('请求参数=>', JSON.stringify(queryObj));
        // 核心处理函数绑定
        const resBody: any = await routes[url](queryObj, ctx);

        if (typeof resBody === 'object') {
            const responseHeaders = resBody.headers || {};
            Object.keys(responseHeaders).forEach((key) => {
                ctx.set(key, responseHeaders[key]);
            });
            if (req.method === 'HEAD') {
                ctx.status = resBody.statusCode || 200;
            } else {
                const responseData = resBody.body || resBody;
                ctx.body = responseData;
            }
        } else if (typeof resBody !== 'undefined') {
            ctx.body = resBody;
        }
    } else {
        ctx.body = '404 not found!!!';
    }
};

export const useWsRoutes = async (ctx, next) => {
    const path = ctx.path;
    console.log(path, 'use-router.ts::61行');
    const handler = wsRoute[path];
    const params = {};
    if (handler) {
        await handler(params, ctx);
    } else {
        next();
    }
};
