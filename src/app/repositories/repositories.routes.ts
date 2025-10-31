import { Router } from "express";

// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { AdminRole, ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { RepositoriesController } from "./repositories.controller";

const router = Router();
const repositoriesController = new RepositoriesController();

router.route("/repositories").post(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.REPOSITORIY_EMPLOYEE,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNTANT
    ]),
    repositoriesController.createRepository
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

router.route("/repositories").get(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.REPOSITORIY_EMPLOYEE,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNTANT,
        //TODO: Remove later
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole)
    ]),
    repositoriesController.getAllRepositories
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

router.route("/repositories/:repositoryID").get(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.REPOSITORIY_EMPLOYEE,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNTANT
    ]),
    repositoriesController.getRepository
    /*
        #swagger.tags = ['Repositories Routes']
    */
);

router.route("/repositories/:repositoryID").patch(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.REPOSITORIY_EMPLOYEE,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNTANT
    ]),
    repositoriesController.updateRepository
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

router.route("/repositories/:repositoryID").delete(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.REPOSITORIY_EMPLOYEE,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNTANT
    ]),
    repositoriesController.deleteRepository
    /*
        #swagger.tags = ['Repositories Routes']
    */
);

export default router;
