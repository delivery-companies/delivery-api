import { EmployeeRole } from "@prisma/client";
import { Router } from "express";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { CustomerOutputController } from "./customerOutput.controller";

const router = Router();
const customerOutputController = new CustomerOutputController();

router
  .route("/customerOutput")
  .post(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.ACCOUNTANT,
      EmployeeRole.REPOSITORIY_EMPLOYEE,
      EmployeeRole.BRANCH_MANAGER,
    ]),
    customerOutputController.saveOrderInCache
  );
router
  .route("/customerOutput")
  .get(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.ACCOUNTANT,
      EmployeeRole.REPOSITORIY_EMPLOYEE,
      EmployeeRole.BRANCH_MANAGER,
    ]),
    customerOutputController.getCustomerOldData
  );
router
  .route("/customerOutputReport")
  .post(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.DATA_ENTRY,
      EmployeeRole.ACCOUNTANT,
      EmployeeRole.REPOSITORIY_EMPLOYEE,
      EmployeeRole.BRANCH_MANAGER,
    ]),
    customerOutputController.saveAndCreateReport
  );
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

export default router;
