import { Router } from "express";

// import { upload } from "../../middlewares/upload.middleware";
import { AdminRole, ClientRole, EmployeeRole, Permission } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { upload } from "../../middlewares/upload";
import { ClientsController } from "./clients.controller";

const router = Router();
const clientsController = new ClientsController();

router.route("/clients").post(
    isLoggedIn,
    isAutherized(
        [
            EmployeeRole.COMPANY_MANAGER,
            AdminRole.ADMIN,
            AdminRole.ADMIN_ASSISTANT,
            EmployeeRole.ACCOUNTANT,
            EmployeeRole.DATA_ENTRY,
            EmployeeRole.BRANCH_MANAGER
        ],
        [Permission.ADD_CLIENT]
    ),
    upload.single("avatar"),
    // upload.none(),
    clientsController.createClient
    /*
        #swagger.tags = ['Clients Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/ClientCreateSchema" },
                    examples: {
                        ClientCreateExample: { $ref: "#/components/examples/ClientCreateExample" }
                    }
                }
            }
        }
    */
);

router.route("/clients").get(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.REPOSITORIY_EMPLOYEE,
        //TODO: Remove later
        ...Object.values(EmployeeRole),
    ]),
    clientsController.getAllClients
    /*
        #swagger.tags = ['Clients Routes']

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

router.route("/clients/:clientID").get(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT
    ]),
    clientsController.getClient
    /*
        #swagger.tags = ['Clients Routes']
    */
);

router.route("/clients/:clientID").patch(
    isLoggedIn,
    //TODO: Maybe add All Clients Roles for profile update
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER
    ]),
    upload.single("avatar"),
    // upload.none(),
    clientsController.updateClient
    /*
        #swagger.tags = ['Clients Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/ClientUpdateSchema" },
                    examples: {
                        ClientUpdateExample: { $ref: "#/components/examples/ClientUpdateExample" }
                    }
                }
            }
        }
    */
);

router.route("/clients/:clientID").delete(
    isLoggedIn,
    isAutherized([AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT, EmployeeRole.COMPANY_MANAGER]),
    clientsController.deleteClient
    /*
        #swagger.tags = ['Clients Routes']
    */
);

router.route("/clients/:clientID/deactivate").patch(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER
    ]),
    clientsController.deactivateClient
    /*
        #swagger.tags = ['Clients Routes']
    */
);

router.route("/clients/:clientID/reactivate").patch(
    isLoggedIn,
    isAutherized([AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT, EmployeeRole.COMPANY_MANAGER]),
    clientsController.reactivateClient
    /*
        #swagger.tags = ['Clients Routes']
    */
);

export default router;
