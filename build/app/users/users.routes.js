"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
const usersController = new users_controller_1.UsersController();
router.route("/profile").get(isLoggedIn_1.isLoggedIn, usersController.getProfile
/*
      #swagger.tags = ['Users Routes']
  */
);
router.route("/update-profile").patch(isLoggedIn_1.isLoggedIn, usersController.updateProfile
/*
      #swagger.tags = ['Users Routes']
  */
);
router.route("/users/login-history").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
]), usersController.getUsersLoginHistory
/*
      #swagger.tags = ['Users Routes']
  */
);
exports.default = router;
//# sourceMappingURL=users.routes.js.map