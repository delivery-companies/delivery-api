"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const reports_controller_1 = require("./reports.controller");
const router = (0, express_1.Router)();
const reportController = new reports_controller_1.ReportController();
router.route("/reports").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.BRANCH_MANAGER,
], [
    client_1.Permission.CREATE_BRANCH_REPORT,
    client_1.Permission.CREATE_REPOSITORY_REPORT,
    client_1.Permission.CREATE_COMPANY_REPORT,
    client_1.Permission.CREATE_DELIVERY_AGENT_REPORT,
    client_1.Permission.CREATE_CLIENT_REPORT,
    client_1.Permission.CREATE_GOVERNMENT_REPORT,
]), reportController.createReport
/*
      #swagger.tags = ['Reports Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/ReportCreateSchema" },
                  "examples": {
                      "ReportCreateExample": { $ref: "#/components/examples/ReportCreateExample" }
                  }
              }
          }
      }
  */
);
router.route("/reports").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), reportController.getAllReports
/*
      #swagger.tags = ['Reports Routes']

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

      #swagger.parameters['sort'] = {
          in: 'query',
          description: 'Sort Query (Default: id:asc)',
          required: false
      }

      #swagger.parameters['start_date'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['end_date'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['client_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['store_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['repository_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['branch_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['delivery_agent_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['governorate'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['status'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['type'] = {
          in: 'query',
          description: '',
          required: false
      }type
  */
);
router.route("/reports/:reportID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), reportController.getReport
/*
      #swagger.tags = ['Reports Routes']
  */
);
router.route("/reports/:reportID/pdf").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), reportController.getReportPDF
/*
      #swagger.tags = ['Reports Routes']
  */
);
router.route("/reports/pdf").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), reportController.getReportsReportPDF
/*
      #swagger.tags = ['Reports Routes']
  */
);
router.route("/reports/:reportID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), reportController.updateReport
/*
      #swagger.tags = ['Reports Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/ReportUpdateSchema" },
                  "examples": {
                      "ReportUpdateExample": { $ref: "#/components/examples/ReportUpdateExample" }
                  }
              }
          }
      }
  */
);
router.route("/reports/:reportID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
], [
    client_1.Permission.DELETE_BRANCH_REPORT,
    client_1.Permission.DELETE_REPOSITORY_REPORT,
    client_1.Permission.DELETE_COMPANY_REPORT,
    client_1.Permission.DELETE_DELIVERY_AGENT_REPORT,
    client_1.Permission.DELETE_CLIENT_REPORT,
    client_1.Permission.DELETE_GOVERNMENT_REPORT,
]), reportController.deleteReport
/*
      #swagger.tags = ['Reports Routes']
  */
);
router.route("/reports/:reportID/deactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.BRANCH_MANAGER,
], [client_1.Permission.DELETE_DELIVERY_AGENT_REPORT]), reportController.deactivateReport
/*
      #swagger.tags = ['Reports Routes']
  */
);
router.route("/reports/:reportID/reactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), reportController.reactivateReport
/*
      #swagger.tags = ['Reports Routes']
  */
);
exports.default = router;
//# sourceMappingURL=reports.routes.js.map