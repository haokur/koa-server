export function GetUserList() {
    return [{ name: 'xxx', age: 18 }];
}

export const UserRoutes = {
    '/user/list': GetUserList,
};
