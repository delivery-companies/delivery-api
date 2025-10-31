import { AdminRole, ClientRole, EmployeeRole, Permission } from "@prisma/client";
// import apicache from "apicache";
import { Router } from "express";
import { isAutherized } from "../../middlewares/isAutherized";
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { LocationsController } from "./locations.controller";

const router = Router();
const locationsController = new LocationsController();
// const cache = apicache.middleware;

router.route("/locations").post(
    isLoggedIn,
    isAutherized(
        [
            EmployeeRole.COMPANY_MANAGER,
            EmployeeRole.ACCOUNTANT,
            EmployeeRole.DATA_ENTRY,
            EmployeeRole.BRANCH_MANAGER
        ],
        [Permission.ADD_LOCATION]
    ),
    // (_req, _res, next) => {
    //     apicache.clear("locations");
    //     next();
    // },
    locationsController.createLocation
    /*
        #swagger.tags = ['Locations Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/LocationCreateSchema" },
                    examples: {
                        LocationCreateExample: { $ref: "#/components/examples/LocationCreateExample" }
                    }
                }
            }
        }
    */
);

// TODO: Remove later
router.route("/public/locations").get(
    // isLoggedIn,
    // isAutherized([Role.ADMIN]),
    // cache("1 hour"),
    // (req, _res, next) => {
    //     // @ts-expect-error
    //     req.apicacheGroup = "locations";
    //     next();
    // },
    locationsController.publicGetAllLocations
    /*
        #swagger.tags = ['Locations Routes']
    */
);

router.route("/locations").get(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER,
        //TODO: Remove later
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole)
    ]),
    // cache("1 hour"),
    // (req, _res, next) => {
    //     // @ts-expect-error
    //     req.apicacheGroup = "locations";
    //     next();
    // },
    locationsController.getAllLocations
    /*
        #swagger.tags = ['Locations Routes']

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

router.route("/locations/:locationID").get(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER
    ]),
    // cache("1 hour"),
    // (req, _res, next) => {
    //     // @ts-expect-error
    //     req.apicacheGroup = "locations";
    //     next();
    // },
    locationsController.getLocation
    /*
        #swagger.tags = ['Locations Routes']
    */
);

router.route("/locations/:locationID").patch(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER
    ]),
    // (_req, _res, next) => {
    //     apicache.clear("locations");
    //     next();
    // },
    locationsController.updateLocation
    /*
        #swagger.tags = ['Locations Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/LocationUpdateSchema" },
                    examples: {
                        LocationUpdateExample: { $ref: "#/components/examples/LocationUpdateExample" }
                    }
                }
            }
        }
    */
);

router.route("/locations/:locationID").delete(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.ACCOUNTANT,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.BRANCH_MANAGER
    ]),
    // (_req, _res, next) => {
    //     apicache.clear("locations");
    //     next();
    // },
    locationsController.deleteLocation
    /*
        #swagger.tags = ['Locations Routes']
    */
);

export default router;
