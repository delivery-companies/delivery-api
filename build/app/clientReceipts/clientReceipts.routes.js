"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const clientReceipts_controller_1 = require("./clientReceipts.controller");
const router = (0, express_1.Router)();
const clientReceiptController = new clientReceipts_controller_1.ClientReceiptController();
router
    .route("/generate-receipts")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
]), clientReceiptController.createReceipts);
exports.default = router;
//# sourceMappingURL=clientReceipts.routes.js.map