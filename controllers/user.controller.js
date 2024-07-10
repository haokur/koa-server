"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
exports.GetUserList = GetUserList;
function GetUserList() {
    return [{ name: 'xxx', age: 18 }];
}
exports.UserRoutes = {
    '/user/list': GetUserList,
};
