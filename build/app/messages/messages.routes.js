"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const messages_controller_1 = require("./messages.controller");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
const messageController = new messages_controller_1.MessagesController();
router
    .route("/send-message")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
]), upload_1.upload.single("image"), messageController.sendMessage);
router
    .route("/chats")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
]), messageController.getUserChatStatics);
router
    .route("/chats/messages")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
]), messageController.getUserChatMessages);
router
    .route("/chats/markAllSeen")
    .patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
]), messageController.markAllSeen);
router
    .route("/chats/deleteAll")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
]), messageController.deleteMessages);
exports.default = router;
//# sourceMappingURL=messages.routes.js.map