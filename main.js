"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_body_1 = __importDefault(require("koa-body"));
const use_router_1 = require("./routes/use-router");
const cors_middleware_1 = require("./middlewares/cors.middleware");
const app = new koa_1.default();
const port = 3000;
const KoaBodyMiddleware = (0, koa_body_1.default)({
    multipart: true,
    formLimit: '12mb',
    jsonLimit: '12mb',
    textLimit: '12mb',
});
app.use(cors_middleware_1.CorsMiddle)
    .use(KoaBodyMiddleware)
    .use(use_router_1.useRoutes)
    .listen(port, () => {
    console.log(`server is run on http://localhost:${port}`);
});
