"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const sizes_controller_1 = require("./sizes.controller");
const router = (0, express_1.Router)();
const sizesController = new sizes_controller_1.SizesController();
router.route("/sizes").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), sizesController.createSize
/*
      #swagger.tags = ['Sizes Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/SizeCreateSchema" },
                  "examples": {
                      "SizeCreateExample": { $ref: "#/components/examples/SizeCreateExample" }
                  }
              }
          }
      }
  */
);
router.route("/sizes").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), sizesController.getAllSizes
/*
      #swagger.tags = ['Sizes Routes']

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
router.route("/sizes/:sizeID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), sizesController.getSize
/*
      #swagger.tags = ['Sizes Routes']
  */
);
router.route("/sizes/:sizeID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), sizesController.updateSize
/*
      #swagger.tags = ['Sizes Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/SizeUpdateSchema" },
                  "examples": {
                      "SizeUpdateExample": { $ref: "#/components/examples/SizeUpdateExample" }
                  }
              }
          }
      }
  */
);
router.route("/sizes/:sizeID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), sizesController.deleteSize
/*
      #swagger.tags = ['Sizes Routes']
  */
);
exports.default = router;
//# sourceMappingURL=sizes.routes.js.map