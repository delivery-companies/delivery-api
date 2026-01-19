"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { upload } from "../../middlewares/upload.middleware";
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const upload_1 = require("../../middlewares/upload");
const stores_controller_1 = require("./stores.controller");
const isApiClient_1 = require("../../middlewares/isApiClient");
const router = (0, express_1.Router)();
const storesController = new stores_controller_1.StoresController();
router.route("/stores").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
], [client_1.Permission.ADD_STORE]), upload_1.upload.single("logo"), 
// upload.none(),
storesController.createStore
/*
      #swagger.tags = ['Stores Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/StoreCreateSchema" },
                  "examples": {
                      "StoreCreateExample": { $ref: "#/components/examples/StoreCreateExample" }
                  }
              }
          }
      }
  */
);
router.route("/stores").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), storesController.getAllStores);
router.route("/client/stores").get(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), storesController.getAllClientStores);
router.route("/stores/:storeID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
]), storesController.getStore
/*
      #swagger.tags = ['Stores Routes']
  */
);
router.route("/stores/:storeID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
]), upload_1.upload.single("logo"), 
// upload.none(),
storesController.updateStore
/*
      #swagger.tags = ['Stores Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/StoreUpdateSchema" },
                  "examples": {
                      "StoreUpdateExample": { $ref: "#/components/examples/StoreUpdateExample" }
                  }
              }
          }
      }
  */
);
router.route("/stores/:storeID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
]), storesController.deleteStore
/*
      #swagger.tags = ['Stores Routes']
  */
);
router.route("/stores/:storeID/deactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
]), storesController.deactivateStore
/*
      #swagger.tags = ['Stores Routes']
  */
);
router.route("/stores/:storeID/reactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
]), storesController.reactivateStore
/*
      #swagger.tags = ['Stores Routes']
  */
);
exports.default = router;
//# sourceMappingURL=stores.routes.js.map