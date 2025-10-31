import { Router } from "express";

import {  ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { DepartmentController } from "./department.controller";
const router = Router();
const departmentController = new DepartmentController();

router.route("/department").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,EmployeeRole.BRANCH_MANAGER,EmployeeRole.ACCOUNT_MANAGER,EmployeeRole.DATA_ENTRY,EmployeeRole.INQUIRY_EMPLOYEE]),
    departmentController.createDepartment
);
router.route("/department").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,EmployeeRole.BRANCH_MANAGER,EmployeeRole.ACCOUNT_MANAGER,EmployeeRole.DATA_ENTRY,EmployeeRole.INQUIRY_EMPLOYEE,ClientRole.CLIENT,EmployeeRole.CLIENT_ASSISTANT,EmployeeRole.DELIVERY_AGENT]),
    departmentController.getAllDepartments
);
router.route("/assignEmployees").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,EmployeeRole.BRANCH_MANAGER,EmployeeRole.ACCOUNT_MANAGER,EmployeeRole.DATA_ENTRY,EmployeeRole.INQUIRY_EMPLOYEE,ClientRole.CLIENT,EmployeeRole.CLIENT_ASSISTANT,EmployeeRole.DELIVERY_AGENT]),
    departmentController.assignDepartmentsToEmployees
);
router.route("/department/:id").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,EmployeeRole.BRANCH_MANAGER,EmployeeRole.ACCOUNT_MANAGER,EmployeeRole.DATA_ENTRY,EmployeeRole.INQUIRY_EMPLOYEE]),
    departmentController.getOne
);
router.route("/department/:id").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,EmployeeRole.BRANCH_MANAGER,EmployeeRole.ACCOUNT_MANAGER,EmployeeRole.DATA_ENTRY,EmployeeRole.INQUIRY_EMPLOYEE]),
    departmentController.editOne
);
router.route("/department/:id").delete(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,EmployeeRole.BRANCH_MANAGER,EmployeeRole.ACCOUNT_MANAGER,EmployeeRole.DATA_ENTRY,EmployeeRole.INQUIRY_EMPLOYEE]),
    departmentController.deleteOne
);
export default router;
