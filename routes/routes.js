"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_controller_1 = require("../controllers/file.controller");
const user_controller_1 = require("../controllers/user.controller");
const route = {
    ...user_controller_1.UserRoutes,
    ...file_controller_1.FileRoutes,
};
exports.default = route;
