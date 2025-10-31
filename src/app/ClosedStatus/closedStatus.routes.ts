import {EmployeeRole} from "@prisma/client";
import {Router} from "express";
import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {CLosedStatusController} from "./closedStatus.controller";

const router = Router();
const cLosedStatusController = new CLosedStatusController();

router
  .route("/closeStatus")
  .post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    cLosedStatusController.createStatus
  );

router
  .route("/closeStatus")
  .get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    cLosedStatusController.getAllStatus
  );

router
  .route("/closeStatus/:id")
  .get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    cLosedStatusController.getOneStatus
  );

router
  .route("/closeStatus/:id")
  .patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    cLosedStatusController.editStatus
  );

router
  .route("/closeStatus/:id")
  .delete(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    cLosedStatusController.deleteStatus
  );
export default router;
