"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const automaticUpdates_controller_1 = require("./automaticUpdates.controller");
const router = (0, express_1.Router)();
const automaticUpdatesController = new automaticUpdates_controller_1.AutomaticUpdatesController();
router.route("/automatic-updates").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), automaticUpdatesController.createAutomaticUpdate
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
router.route("/automatic-updates").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), automaticUpdatesController.getAllAutomaticUpdates
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
router.route("/automatic-updates/:automaticUpdateID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), automaticUpdatesController.getAutomaticUpdate
/*
    #swagger.tags = ['Automatic Updates Routes']
*/
);
router.route("/automatic-updates/:automaticUpdateID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), automaticUpdatesController.updateAutomaticUpdate
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
router.route("/automatic-updates/:automaticUpdateID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), automaticUpdatesController.deleteAutomaticUpdate
/*
    #swagger.tags = ['Automatic Updates Routes']
*/
);
exports.default = router;
//# sourceMappingURL=automaticUpdates.routes.js.map