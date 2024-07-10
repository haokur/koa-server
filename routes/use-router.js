"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRoutes = void 0;
const routes_1 = __importDefault(require("./routes"));
const useRoutes = async (ctx) => {
    const { request: req } = ctx;
    const [url, query = ''] = req.url.split('?');
    // 解析参数
    const queryObj = {};
    // 1.拼接get请求参数
    query.split('&').forEach((item) => {
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
            }
            catch (error) {
                console.log(error, 'main.ts::112行');
            }
        }
        else if (typeof typeOfReqBody === 'object') {
            Object.assign(queryObj, req.body);
        }
    }
    // 3.匹配handler，响应操作返回数据
    const routeHandler = routes_1.default[url];
    if (url && routeHandler && typeof routeHandler === 'function') {
        console.log('请求参数=>', JSON.stringify(queryObj));
        // 核心处理函数绑定
        const resBody = await routes_1.default[url](queryObj, ctx);
        if (typeof resBody === 'object') {
            const { body, headers } = resBody;
            if (typeof headers === 'object') {
                Object.keys(headers).forEach((key) => {
                    ctx.set(key, headers[key]);
                });
            }
            ctx.body = body || resBody;
        }
        else if (typeof resBody !== 'undefined') {
            ctx.body = resBody;
        }
    }
    else {
        ctx.body = '404 not found!!!';
    }
};
exports.useRoutes = useRoutes;
