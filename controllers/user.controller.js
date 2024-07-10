"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
exports.GetUserList = GetUserList;
function GetUserList() {
    return [{ name: 'xxx', age: 18 }];
}
exports.userRoutes = {
    '/user/list': GetUserList,
};
