import { Router } from "express";

// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { AdminRole, ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { BranchesController } from "./branches.controller";

const router = Router();
const branchesController = new BranchesController();

router.route("/branches").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    branchesController.createBranch
    /*
        #swagger.tags = ['Branches Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/BranchCreateSchema" },
                    examples: {
                        BranchCreateExample: { $ref: "#/components/examples/BranchCreateExample" }
                    }
                }
            }
        }
    */
);

router.route("/branches").get(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        //TODO: Remove later
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole)
    ]),
    branchesController.getAllBranches
    /*
        #swagger.tags = ['Branches Routes']

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
    */
);

router.route("/branches/:branchID").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    branchesController.getBranch
    /*
        #swagger.tags = ['Branches Routes']
    */
);

router.route("/branches/:branchID").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    branchesController.updateBranch
    /*
        #swagger.tags = ['Branches Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/BranchUpdateSchema" },
                    examples: {
                        BranchUpdateExample: { $ref: "#/components/examples/BranchUpdateExample" }
                    }
                }
            }
        }
    */
);

router.route("/branches/:branchID").delete(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    branchesController.deleteBranch
    /*
        #swagger.tags = ['Branches Routes']
    */
);

export default router;
