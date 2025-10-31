import { Router } from "express";

// import { upload } from "../../middlewares/upload.middleware";
import { AdminRole, ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { upload } from "../../middlewares/upload";
import { BannersController } from "./banners.controller";

const router = Router();
const bannersController = new BannersController();

router.route("/banners").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER]),
    upload.single("image"),
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

router.route("/banners").get(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT,
        // TODO: Remove later
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole)
    ]),
    bannersController.getAllBanners
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

router.route("/banners/:bannerID").get(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT
    ]),
    bannersController.getBanner
    /*
        #swagger.tags = ['Banners Routes']
    */
);

router.route("/banners/:bannerID").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    upload.single("image"),
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

router.route("/banners/:bannerID").delete(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER, AdminRole.ADMIN, AdminRole.ADMIN_ASSISTANT]),
    bannersController.deleteBanner
    /*
        #swagger.tags = ['Banners Routes']
    */
);

export default router;
