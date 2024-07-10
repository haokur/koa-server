"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const use_router_1 = require("./routes/use-router");
const cors_middleware_1 = require("./middlewares/cors.middleware");
const app = new koa_1.default();
const port = 3000;
app.use(cors_middleware_1.CorsMiddle)
    .use(use_router_1.useRoutes)
    .listen(port, () => {
    console.log(`server is run on http://localhost:${port}`);
});
