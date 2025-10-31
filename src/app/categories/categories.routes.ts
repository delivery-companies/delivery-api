import { Router } from "express";

import { AdminRole, ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { CategoriesController } from "./categories.controller";

const router = Router();
const categoriesController = new CategoriesController();

router.route("/categories").post(
    isLoggedIn,
    isAutherized([EmployeeRole.CLIENT_ASSISTANT,ClientRole.CLIENT]),
    categoriesController.createCategory
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

router.route("/categories").get(
    isLoggedIn,
    isAutherized([
        EmployeeRole.CLIENT_ASSISTANT,ClientRole.CLIENT,
        //TODO: Remove later
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole)
    ]),
    categoriesController.getAllCategories
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

router.route("/categories/:categoryID").get(
    isLoggedIn,
    isAutherized([EmployeeRole.CLIENT_ASSISTANT,ClientRole.CLIENT]),
    categoriesController.getCategory
    /*
        #swagger.tags = ['Categories Routes']
    */
);

router.route("/categories/:categoryID").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.CLIENT_ASSISTANT,ClientRole.CLIENT]),
    categoriesController.updateCategory
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

router.route("/categories/:categoryID").delete(
    isLoggedIn,
    isAutherized([EmployeeRole.CLIENT_ASSISTANT,ClientRole.CLIENT]),
    categoriesController.deleteCategory
    /*
        #swagger.tags = ['Categories Routes']
    */
);

export default router;
