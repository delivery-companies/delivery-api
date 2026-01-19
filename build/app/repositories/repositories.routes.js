"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const repositories_controller_1 = require("./repositories.controller");
const router = (0, express_1.Router)();
const repositoriesController = new repositories_controller_1.RepositoriesController();
router.route("/repositories").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT
]), repositoriesController.createRepository
/*
    #swagger.tags = ['Repositories Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                "schema": { $ref: "#/components/schemas/RepositoryCreateSchema" },
                "examples": {
                    "RepositoryCreateExample": { $ref: "#/components/examples/RepositoryCreateExample" }
                }
            }
        }
    }
*/
);
router.route("/repositories").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole)
]), repositoriesController.getAllRepositories
/*
    #swagger.tags = ['Repositories Routes']

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
router.route("/repositories/:repositoryID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT
]), repositoriesController.getRepository
/*
    #swagger.tags = ['Repositories Routes']
*/
);
router.route("/repositories/:repositoryID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT
]), repositoriesController.updateRepository
/*
    #swagger.tags = ['Repositories Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                "schema": { $ref: "#/components/schemas/RepositoryUpdateSchema" },
                "examples": {
                    "RepositoryUpdateExample": { $ref: "#/components/examples/RepositoryUpdateExample" }
                }
            }
        }
    }
*/
);
router.route("/repositories/:repositoryID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT
]), repositoriesController.deleteRepository
/*
    #swagger.tags = ['Repositories Routes']
*/
);
exports.default = router;
//# sourceMappingURL=repositories.routes.js.map