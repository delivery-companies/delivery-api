import {ClientRole, EmployeeRole} from "@prisma/client";
import {Router} from "express";
import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {ClientReceiptController} from "./clientReceipts.controller";

const router = Router();
const clientReceiptController = new ClientReceiptController();

router
  .route("/generate-receipts")
  .post(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.ACCOUNTANT,
      ClientRole.CLIENT,
      EmployeeRole.CLIENT_ASSISTANT,
    ]),
    clientReceiptController.createReceipts
  );
export default router;
