"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.route("/auth/signin").post(authController.signin);
router.route("/auth/validate-token").post(isLoggedIn_1.isLoggedIn, (_req, res) => {
    res.status(200).json({
        status: "valid",
    });
});
router.route("/auth/refresh-token").post(authController.refreshToken
/*
      #swagger.tags = ['Auth Routes']
  */
);
router.route("/auth/signout").post(isLoggedIn_1.isLoggedIn, authController.signout
/*
      #swagger.tags = ['Auth Routes']
  */
);
router.route("/auth/signout/:userID").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)(["ADMIN", "ADMIN_ASSISTANT", "COMPANY_MANAGER"]), authController.signoutUser
/*
      #swagger.tags = ['Auth Routes']
  */
);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map