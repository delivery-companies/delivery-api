import {Router} from "express";

import {AuthController} from "./auth.controller";

import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";

const router = Router();
const authController = new AuthController();

router.route("/auth/signin").post(authController.signin);

router.route("/auth/validate-token").post(isLoggedIn, (_req, res) => {
  res.status(200).json({
    status: "valid",
  });
});

router.route("/auth/refresh-token").post(
  authController.refreshToken
  /*
        #swagger.tags = ['Auth Routes']
    */
);

router.route("/auth/signout").post(
  isLoggedIn,
  authController.signout
  /*
        #swagger.tags = ['Auth Routes']
    */
);

router.route("/auth/signout/:userID").post(
  isLoggedIn,
  isAutherized(["ADMIN", "ADMIN_ASSISTANT", "COMPANY_MANAGER"]),
  authController.signoutUser
  /*
        #swagger.tags = ['Auth Routes']
    */
);

export default router;
