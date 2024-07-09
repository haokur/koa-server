"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const app = new koa_1.default();
app.use(async (ctx) => {
    const obj = {
        a: 1,
    };
    console.log(obj, 'main.ts::9行');
    ctx.body = 'Hello,Koa!';
});
app.listen(3000, () => {
    console.log('server is run on http://localhost:3000');
});
