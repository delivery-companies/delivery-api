import { Router } from "express";

// import { upload } from "../../middlewares/upload.middleware";
import { AdminRole, ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { upload } from "../../middlewares/upload";
import { ProductsController } from "./products.controller";

const router = Router();
const productsController = new ProductsController();

router.route("/products").post(
    isLoggedIn,
    isAutherized([
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT
    ]),
    upload.single("image"),
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

router.route("/products").get(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT,
        //TODO: Remove later
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole)
    ]),
    productsController.getAllProducts
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

router.route("/products/:productID").get(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT
    ]),
    productsController.getProduct
    /*
        #swagger.tags = ['Products Routes']
    */
);

router.route("/products/:productID").patch(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT
    ]),
    upload.single("image"),
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

router.route("/products/:productID").delete(
    isLoggedIn,
    isAutherized([
        AdminRole.ADMIN,
        AdminRole.ADMIN_ASSISTANT,
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT
    ]),
    productsController.deleteProduct
    /*
        #swagger.tags = ['Products Routes']
    */
);

export default router;
