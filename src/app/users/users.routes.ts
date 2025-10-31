import { AdminRole, EmployeeRole } from "@prisma/client";
import { Router } from "express";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { UsersController } from "./users.controller";

const router = Router();
const usersController = new UsersController();

router.route("/profile").get(
  isLoggedIn,
  usersController.getProfile
  /*
        #swagger.tags = ['Users Routes']
    */
);

router.route("/update-profile").patch(
  isLoggedIn,
  usersController.updateProfile
  /*
        #swagger.tags = ['Users Routes']
    */
);

router.route("/users/login-history").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
  ]),
  usersController.getUsersLoginHistory
  /*
        #swagger.tags = ['Users Routes']
    */
);

export default router;
