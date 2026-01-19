"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const categories_controller_1 = require("./categories.controller");
const router = (0, express_1.Router)();
const categoriesController = new categories_controller_1.CategoriesController();
router.route("/categories").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), categoriesController.createCategory
/*
      #swagger.tags = ['Categories Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/CategoryCreateSchema" },
                  "examples": {
                      "CategoryCreateExample": { $ref: "#/components/examples/CategoryCreateExample" }
                  }
              }
          }
      }
  */
);
router.route("/categories").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), categoriesController.getAllCategories
/*
      #swagger.tags = ['Categories Routes']

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
router.route("/categories/:categoryID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), categoriesController.getCategory
/*
      #swagger.tags = ['Categories Routes']
  */
);
router.route("/categories/:categoryID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), categoriesController.updateCategory
/*
      #swagger.tags = ['Categories Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  "schema": { $ref: "#/components/schemas/CategoryUpdateSchema" },
                  "examples": {
                      "CategoryUpdateExample": { $ref: "#/components/examples/CategoryUpdateExample" }
                  }
              }
          }
      }
  */
);
router.route("/categories/:categoryID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.CLIENT_ASSISTANT, client_1.ClientRole.CLIENT]), categoriesController.deleteCategory
/*
      #swagger.tags = ['Categories Routes']
  */
);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map