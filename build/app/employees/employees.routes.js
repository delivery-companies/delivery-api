"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { upload } from "../../middlewares/upload.middleware";
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { EmployeeRole } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const upload_1 = require("../../middlewares/upload");
const employees_controller_1 = require("./employees.controller");
const router = (0, express_1.Router)();
const employeesController = new employees_controller_1.EmployeesController();
router.route("/employees").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
], [client_1.Permission.ADD_DELIVERY_AGENT, client_1.Permission.MANAGE_EMPLOYEES]), upload_1.upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "residencyCard", maxCount: 1 },
]), 
// upload.none(),
employeesController.createEmployee
/*
      #swagger.tags = ['Employees Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/EmployeeCreateSchema" },
                  examples: {
                      EmployeeCreateExample: { $ref: "#/components/examples/EmployeeCreateExample" }
                  }
              }
          }
      }
  */
);
router.route("/employees").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), employeesController.getAllEmployees
/*
      #swagger.tags = ['Employees Routes']

      #swagger.parameters['page'] = {
          in: 'query',
          description: 'Page Number',
          required: false
      }

      #swagger.parameters['size'] = {
          in: 'query',
          description: 'Page Size (Number of Items per Page) (Default: 10)',
          required: false
      }

      #swagger.parameters['roles'] = {
          in: 'query',
          description: 'Employee EmployeeRoles (Comma Separated)',
          required: false
      }
  */
);
router.route("/employees/:employeeID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), employeesController.getEmployee
/*
      #swagger.tags = ['Employees Routes']
  */
);
router.route("/employees/:employeeID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.EmployeeRole.BRANCH_MANAGER,
]), 
// upload.single("avatar"),
// upload.single("idCard"),
// upload.single("residencyCard"),
upload_1.upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "residencyCard", maxCount: 1 },
]), 
// upload.none(),
employeesController.updateEmployee
/*
      #swagger.tags = ['Employees Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/EmployeeUpdateSchema" },
                  examples: {
                      EmployeeUpdateExample: { $ref: "#/components/examples/EmployeeUpdateExample" }
                  }
              }
          }
      }
  */
);
router.route("/employees/:employeeID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
]), employeesController.deleteEmployee
/*
      #swagger.tags = ['Employees Routes']
  */
);
router.route("/employees/:employeeID/deactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
]), employeesController.deactivateEmployee
/*
      #swagger.tags = ['Employees Routes']
  */
);
router.route("/employees/:employeeID/reactivate").patch(isLoggedIn_1.isLoggedIn, 
//TODO: Maybe add All Employee Roles for profile update
(0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), employeesController.reactivateEmployee
/*
      #swagger.tags = ['Employees Routes']
  */
);
exports.default = router;
//# sourceMappingURL=employees.routes.js.map