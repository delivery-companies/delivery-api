"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// import apicache from "apicache";
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const locations_controller_1 = require("./locations.controller");
const router = (0, express_1.Router)();
const locationsController = new locations_controller_1.LocationsController();
// const cache = apicache.middleware;
router.route("/locations").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
], [client_1.Permission.ADD_LOCATION]), 
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
router
    .route("/public/locations")
    .get(locationsController.publicGetAllLocations);
router.route("/locations").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
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
router.route("/locations/:locationID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
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
router.route("/locations/:locationID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
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
router.route("/locations/:locationID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
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
exports.default = router;
//# sourceMappingURL=locations.routes.js.map