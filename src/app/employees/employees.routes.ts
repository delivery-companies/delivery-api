import { Router } from "express";

// import { upload } from "../../middlewares/upload.middleware";
import {
  AdminRole,
  ClientRole,
  EmployeeRole,
  Permission,
} from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
// import { EmployeeRole } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { upload } from "../../middlewares/upload";
import { EmployeesController } from "./employees.controller";

const router = Router();
const employeesController = new EmployeesController();

router.route("/employees").post(
  isLoggedIn,
  isAutherized(
    [
      AdminRole.ADMIN,
      AdminRole.ADMIN_ASSISTANT,
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.BRANCH_MANAGER,
      EmployeeRole.CLIENT,
      EmployeeRole.CLIENT_ASSISTANT,
    ],
    [Permission.ADD_DELIVERY_AGENT, Permission.MANAGE_EMPLOYEES]
  ),
  upload.fields([
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

router.route("/employees").get(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    //TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  employeesController.getAllEmployees
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

router.route("/employees/:employeeID").get(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  employeesController.getEmployee
  /*
        #swagger.tags = ['Employees Routes']
    */
);

router.route("/employees/:employeeID").patch(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    EmployeeRole.BRANCH_MANAGER,
  ]),
  // upload.single("avatar"),
  // upload.single("idCard"),
  // upload.single("residencyCard"),
  upload.fields([
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

router.route("/employees/:employeeID").delete(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
  ]),
  employeesController.deleteEmployee
  /*
        #swagger.tags = ['Employees Routes']
    */
);

router.route("/employees/:employeeID/deactivate").patch(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
  ]),
  employeesController.deactivateEmployee
  /*
        #swagger.tags = ['Employees Routes']
    */
);

router.route("/employees/:employeeID/reactivate").patch(
  isLoggedIn,
  //TODO: Maybe add All Employee Roles for profile update
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  employeesController.reactivateEmployee
  /*
        #swagger.tags = ['Employees Routes']
    */
);

export default router;
