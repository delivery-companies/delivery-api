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
const banners_controller_1 = require("./banners.controller");
const router = (0, express_1.Router)();
const bannersController = new banners_controller_1.BannersController();
router.route("/banners").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER]), upload_1.upload.single("image"), 
// upload.none(),
bannersController.createBanner
/*
    #swagger.tags = ['Banners Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                "schema": { $ref: "#/components/schemas/BannerCreateSchema" },
                "examples": {
                    "BannerCreateExample": { $ref: "#/components/examples/BannerCreateExample" }
                }
            }
        }
    }
*/
);
router.route("/banners").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole)
]), bannersController.getAllBanners
/*
    #swagger.tags = ['Banners Routes']

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
router.route("/banners/:bannerID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT
]), bannersController.getBanner
/*
    #swagger.tags = ['Banners Routes']
*/
);
router.route("/banners/:bannerID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), upload_1.upload.single("image"), 
// upload.none(),
bannersController.updateBanner
/*
    #swagger.tags = ['Banners Routes']

    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                "schema": { $ref: "#/components/schemas/BannerUpdateSchema" },
                "examples": {
                    "BannerUpdateExample": { $ref: "#/components/examples/BannerUpdateExample" }
                }
            }
        }
    }
*/
);
router.route("/banners/:bannerID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER, client_1.AdminRole.ADMIN, client_1.AdminRole.ADMIN_ASSISTANT]), bannersController.deleteBanner
/*
    #swagger.tags = ['Banners Routes']
*/
);
exports.default = router;
//# sourceMappingURL=banners.routes.js.map