import {Router} from "express";

import {ClientRole, EmployeeRole} from "@prisma/client";
import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {MessagesController} from "./messages.controller";
import {upload} from "../../middlewares/upload";

const router = Router();

const messageController = new MessagesController();

router
  .route("/send-message")
  .post(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.ACCOUNT_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.INQUIRY_EMPLOYEE,
      EmployeeRole.DELIVERY_AGENT,
      EmployeeRole.CLIENT_ASSISTANT,
      EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
      ClientRole.CLIENT,
    ]),
    upload.single("image"),
    messageController.sendMessage
  );

router
  .route("/chats")
  .get(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.ACCOUNT_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.INQUIRY_EMPLOYEE,
      EmployeeRole.REPOSITORIY_EMPLOYEE,
      EmployeeRole.DELIVERY_AGENT,
      EmployeeRole.CLIENT_ASSISTANT,
      EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
      ClientRole.CLIENT,
    ]),
    messageController.getUserChatStatics
  );

router
  .route("/chats/messages")
  .get(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.ACCOUNT_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.INQUIRY_EMPLOYEE,
      EmployeeRole.DELIVERY_AGENT,
      EmployeeRole.CLIENT_ASSISTANT,
      EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
      ClientRole.CLIENT,
    ]),
    messageController.getUserChatMessages
  );

router
  .route("/chats/markAllSeen")
  .patch(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.ACCOUNT_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.INQUIRY_EMPLOYEE,
      EmployeeRole.DELIVERY_AGENT,
      EmployeeRole.CLIENT_ASSISTANT,
      EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
      ClientRole.CLIENT,
    ]),
    messageController.markAllSeen
  );

router
  .route("/chats/deleteAll")
  .post(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.ACCOUNT_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.INQUIRY_EMPLOYEE,
      EmployeeRole.DELIVERY_AGENT,
      EmployeeRole.CLIENT_ASSISTANT,
      EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
      ClientRole.CLIENT,
    ]),
    messageController.deleteMessages
  );
export default router;
