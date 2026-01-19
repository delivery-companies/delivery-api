"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const closedStatus_controller_1 = require("./closedStatus.controller");
const router = (0, express_1.Router)();
const cLosedStatusController = new closedStatus_controller_1.CLosedStatusController();
router
    .route("/closeStatus")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), cLosedStatusController.createStatus);
router
    .route("/closeStatus")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), cLosedStatusController.getAllStatus);
router
    .route("/closeStatus/:id")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), cLosedStatusController.getOneStatus);
router
    .route("/closeStatus/:id")
    .patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), cLosedStatusController.editStatus);
router
    .route("/closeStatus/:id")
    .delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), cLosedStatusController.deleteStatus);
exports.default = router;
//# sourceMappingURL=closedStatus.routes.js.map