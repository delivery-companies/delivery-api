"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const customerOutput_controller_1 = require("./customerOutput.controller");
const router = (0, express_1.Router)();
const customerOutputController = new customerOutput_controller_1.CustomerOutputController();
router
    .route("/customerOutput")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
]), customerOutputController.saveOrderInCache);
router
    .route("/customerOutput")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
]), customerOutputController.getCustomerOldData);
router
    .route("/customerOutputReport")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
]), customerOutputController.saveAndCreateReport);
// router.route("/customerOutput").delete(
//     isLoggedIn,
//     isAutherized(
//         [
//             EmployeeRole.COMPANY_MANAGER,
//             EmployeeRole.DATA_ENTRY,
//             EmployeeRole.ACCOUNTANT,
//             EmployeeRole.REPOSITORIY_EMPLOYEE,
//         ],
//     ),
//     customerOutputController.deleteOrderFromSavedData
// );
exports.default = router;
//# sourceMappingURL=customerOutput.routes.js.map