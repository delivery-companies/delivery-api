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
const products_controller_1 = require("./products.controller");
const router = (0, express_1.Router)();
const productsController = new products_controller_1.ProductsController();
router.route("/products").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT
]), upload_1.upload.single("image"), 
// upload.none(),
productsController.createProduct
/*
    #swagger.tags = ['Products Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                "schema": { $ref: "#/components/schemas/ProductCreateSchema" },
                "examples": {
                    "ProductCreateExample": { $ref: "#/components/examples/ProductCreateExample" }
                }
            }
        }
    }
*/
);
router.route("/products").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    //TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole)
]), productsController.getAllProducts
/*
    #swagger.tags = ['Products Routes']

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
router.route("/products/:productID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT
]), productsController.getProduct
/*
    #swagger.tags = ['Products Routes']
*/
);
router.route("/products/:productID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT
]), upload_1.upload.single("image"), 
// upload.none(),
productsController.updateProduct
/*
    #swagger.tags = ['Products Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                "schema": { $ref: "#/components/schemas/ProductUpdateSchema" },
                "examples": {
                    "ProductUpdateExample": { $ref: "#/components/examples/ProductUpdateExample" }
                }
            }
        }
    }
*/
);
router.route("/products/:productID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT
]), productsController.deleteProduct
/*
    #swagger.tags = ['Products Routes']
*/
);
exports.default = router;
//# sourceMappingURL=products.routes.js.map