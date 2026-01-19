"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { upload } from "../../middlewares/upload.middleware";
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { AdminRole } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const upload_1 = require("../../middlewares/upload");
const companies_controller_1 = require("./companies.controller");
const router = (0, express_1.Router)();
const companiesController = new companies_controller_1.CompaniesController();
router.route("/companies").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), upload_1.upload.single("logo"), 
// upload.none(),
companiesController.createCompany
/*
    #swagger.tags = ['Companies Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/CompanyCreateSchema" },
                examples: {
                    CompanyCreateExample: { $ref: "#/components/examples/CompanyCreateExample" }
                }
            }
        }
    }
*/
);
router.route("/companies").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole)
]), companiesController.getAllCompanies
/*
    #swagger.tags = ['Companies Routes']

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
router.route("/companies/:companyID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), companiesController.getCompany
/*
    #swagger.tags = ['Companies Routes']
*/
);
router.route("/companies/:companyID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), upload_1.upload.single("logo"), 
// upload.none(),
companiesController.updateCompany
/*
    #swagger.tags = ['Companies Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/CompanyUpdateSchema" },
                examples: {
                    CompanyUpdateExample: { $ref: "#/components/examples/CompanyUpdateExample" }
                }
            }
        }
    }
*/
);
router.route("/companies/:companyID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), companiesController.deleteCompany
/*
    #swagger.tags = ['Companies Routes']
*/
);
exports.default = router;
//# sourceMappingURL=companies.routes.js.map