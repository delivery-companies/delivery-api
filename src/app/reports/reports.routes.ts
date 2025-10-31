import {Router} from "express";

// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import {AdminRole, ClientRole, EmployeeRole, Permission} from "@prisma/client";
import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {ReportController} from "./reports.controller";

const router = Router();
const reportController = new ReportController();

router.route("/reports").post(
  isLoggedIn,
  isAutherized(
    [
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.REPOSITORIY_EMPLOYEE,
      EmployeeRole.ACCOUNTANT,
      EmployeeRole.BRANCH_MANAGER,
    ],
    [
      Permission.CREATE_BRANCH_REPORT,
      Permission.CREATE_REPOSITORY_REPORT,
      Permission.CREATE_COMPANY_REPORT,
      Permission.CREATE_DELIVERY_AGENT_REPORT,
      Permission.CREATE_CLIENT_REPORT,
      Permission.CREATE_GOVERNMENT_REPORT,
    ]
  ),
  reportController.createReport
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

router.route("/reports").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  reportController.getAllReports
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

router.route("/reports/:reportID").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  reportController.getReport
  /*
        #swagger.tags = ['Reports Routes']
    */
);

router.route("/reports/:reportID/pdf").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  reportController.getReportPDF
  /*
        #swagger.tags = ['Reports Routes']
    */
);

router.route("/reports/pdf").post(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  reportController.getReportsReportPDF
  /*
        #swagger.tags = ['Reports Routes']
    */
);

router.route("/reports/:reportID").patch(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  reportController.updateReport
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

router.route("/reports/:reportID").delete(
  isLoggedIn,
  isAutherized(
    [
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      AdminRole.ADMIN,
      AdminRole.ADMIN_ASSISTANT,
    ],
    [
      Permission.DELETE_BRANCH_REPORT,
      Permission.DELETE_REPOSITORY_REPORT,
      Permission.DELETE_COMPANY_REPORT,
      Permission.DELETE_DELIVERY_AGENT_REPORT,
      Permission.DELETE_CLIENT_REPORT,
      Permission.DELETE_GOVERNMENT_REPORT,
    ]
  ),
  reportController.deleteReport
  /*
        #swagger.tags = ['Reports Routes']
    */
);

router.route("/reports/:reportID/deactivate").patch(
  isLoggedIn,
  isAutherized(
    [
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.REPOSITORIY_EMPLOYEE,
      EmployeeRole.ACCOUNTANT,
      EmployeeRole.BRANCH_MANAGER,
    ],
    [Permission.DELETE_DELIVERY_AGENT_REPORT]
  ),
  reportController.deactivateReport
  /*
        #swagger.tags = ['Reports Routes']
    */
);

router.route("/reports/:reportID/reactivate").patch(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  reportController.reactivateReport
  /*
        #swagger.tags = ['Reports Routes']
    */
);

export default router;
