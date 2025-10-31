import { AdminRole, EmployeeRole } from "@prisma/client";
import { Router } from "express";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { AutomaticUpdatesController } from "./automaticUpdates.controller";

const router = Router();
const automaticUpdatesController = new AutomaticUpdatesController();

router.route("/automatic-updates").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    automaticUpdatesController.createAutomaticUpdate
    /*
        #swagger.tags = ['Automatic Updates Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    "schema": { $ref: "#/components/schemas/AutomaticUpdateCreateSchema" },
                    "examples": {
                        "AutomaticUpdateCreateExample": { $ref: "#/components/examples/AutomaticUpdateCreateExample" }
                    }
                }
            }
        }
    */
);

router.route("/automatic-updates").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    automaticUpdatesController.getAllAutomaticUpdates
    /*
        #swagger.tags = ['Automatic Updates Routes']

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

router.route("/automatic-updates/:automaticUpdateID").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    automaticUpdatesController.getAutomaticUpdate
    /*
        #swagger.tags = ['Automatic Updates Routes']
    */
);

router.route("/automatic-updates/:automaticUpdateID").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    automaticUpdatesController.updateAutomaticUpdate
    /*
        #swagger.tags = ['Automatic Updates Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    "schema": { $ref: "#/components/schemas/AutomaticUpdateUpdateSchema" },
                    "examples": {
                        "AutomaticUpdateUpdateExample": { $ref: "#/components/examples/AutomaticUpdateUpdateExample" }
                    }
                }
            }
        }
    */
);

router.route("/automatic-updates/:automaticUpdateID").delete(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    automaticUpdatesController.deleteAutomaticUpdate
    /*
        #swagger.tags = ['Automatic Updates Routes']
    */
);

export default router;
