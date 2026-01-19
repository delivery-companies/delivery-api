"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const branches_controller_1 = require("./branches.controller");
const router = (0, express_1.Router)();
const branchesController = new branches_controller_1.BranchesController();
router.route("/branches").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), branchesController.createBranch
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
router.route("/branches").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole)
]), branchesController.getAllBranches
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
router.route("/branches/:branchID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), branchesController.getBranch
/*
    #swagger.tags = ['Branches Routes']
*/
);
router.route("/branches/:branchID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), branchesController.updateBranch
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
router.route("/branches/:branchID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), branchesController.deleteBranch
/*
    #swagger.tags = ['Branches Routes']
*/
);
exports.default = router;
//# sourceMappingURL=branches.routes.js.map