export function GetUserList() {
    return [{ name: 'xxx', age: 18 }];
}

export const userRoutes = {
    '/user/list': GetUserList,
};
