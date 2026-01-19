"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const colors_controller_1 = require("./colors.controller");
const router = (0, express_1.Router)();
const colorsController = new colors_controller_1.ColorsController();
router.route("/colors").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), colorsController.createColor
/*
      #swagger.tags = ['Colors Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/ColorCreateSchema" },
                  "examples": {
                      "ColorCreateExample": { $ref: "#/components/examples/ColorCreateExample" }
                  }
              }
          }
      }
  */
);
router.route("/colors").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), colorsController.getAllColors
/*
      #swagger.tags = ['Colors Routes']

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
router.route("/colors/:colorID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), colorsController.getColor
/*
      #swagger.tags = ['Colors Routes']
  */
);
router.route("/colors/:colorID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), colorsController.updateColor
/*
      #swagger.tags = ['Colors Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/ColorUpdateSchema" },
                  "examples": {
                      "ColorUpdateExample": { $ref: "#/components/examples/ColorUpdateExample" }
                  }
              }
          }
      }
  */
);
router.route("/colors/:colorID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), colorsController.deleteColor
/*
      #swagger.tags = ['Colors Routes']
  */
);
exports.default = router;
//# sourceMappingURL=colors.routes.js.map