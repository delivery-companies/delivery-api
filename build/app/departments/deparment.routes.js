"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const department_controller_1 = require("./department.controller");
const router = (0, express_1.Router)();
const departmentController = new department_controller_1.DepartmentController();
router.route("/department").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.EmployeeRole.BRANCH_MANAGER, client_1.EmployeeRole.ACCOUNT_MANAGER, client_1.EmployeeRole.DATA_ENTRY, client_1.EmployeeRole.INQUIRY_EMPLOYEE]), departmentController.createDepartment);
router.route("/department").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.EmployeeRole.BRANCH_MANAGER, client_1.EmployeeRole.ACCOUNT_MANAGER, client_1.EmployeeRole.DATA_ENTRY, client_1.EmployeeRole.INQUIRY_EMPLOYEE, client_1.ClientRole.CLIENT, client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.EmployeeRole.DELIVERY_AGENT]), departmentController.getAllDepartments);
router.route("/assignEmployees").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.EmployeeRole.BRANCH_MANAGER, client_1.EmployeeRole.ACCOUNT_MANAGER, client_1.EmployeeRole.DATA_ENTRY, client_1.EmployeeRole.INQUIRY_EMPLOYEE, client_1.ClientRole.CLIENT, client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.EmployeeRole.DELIVERY_AGENT]), departmentController.assignDepartmentsToEmployees);
router.route("/department/:id").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.EmployeeRole.BRANCH_MANAGER, client_1.EmployeeRole.ACCOUNT_MANAGER, client_1.EmployeeRole.DATA_ENTRY, client_1.EmployeeRole.INQUIRY_EMPLOYEE]), departmentController.getOne);
router.route("/department/:id").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.EmployeeRole.BRANCH_MANAGER, client_1.EmployeeRole.ACCOUNT_MANAGER, client_1.EmployeeRole.DATA_ENTRY, client_1.EmployeeRole.INQUIRY_EMPLOYEE]), departmentController.editOne);
router.route("/department/:id").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.EmployeeRole.BRANCH_MANAGER, client_1.EmployeeRole.ACCOUNT_MANAGER, client_1.EmployeeRole.DATA_ENTRY, client_1.EmployeeRole.INQUIRY_EMPLOYEE]), departmentController.deleteOne);
exports.default = router;
//# sourceMappingURL=deparment.routes.js.map