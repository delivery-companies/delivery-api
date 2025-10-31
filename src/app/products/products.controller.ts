import { AdminRole, ClientRole } from "@prisma/client";
import { AppError } from "../../lib/AppError";
import { catchAsync } from "../../lib/catchAsync";
import type { loggedInUserType } from "../../types/user";
import { ClientsRepository } from "../clients/clients.repository";
import { ProductCreateSchema, ProductUpdateSchema } from "./products.dto";
import { ProductsRepository } from "./products.repository";

const productsRepository = new ProductsRepository();
const clientsRepository = new ClientsRepository();

export class ProductsController {
    createProduct = catchAsync(async (req, res) => {
        const productData = ProductCreateSchema.parse(req.body);
        // const loggedInUserID = +res.locals.user.id;
        const companyID = +res.locals.user.companyID;

        let image: string | undefined;
        if (req.file) {
            const file = req.file as Express.MulterS3.File;
            image = file.location;
        }

        // Get the clientID
        const clientID = await clientsRepository.getClientIDByStoreID({ storeID: productData.storeID });
        if (!clientID) {
            throw new AppError("حصل حطأ في ايجاد صاحب المتجر", 500);
        }

        const createdProduct = await productsRepository.createProduct(companyID, clientID, {
            ...productData,
            image
        });

        res.status(200).json({
            status: "success",
            data: createdProduct
        });
    });

    getAllProducts = catchAsync(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user as loggedInUserType;
        let companyID: number | undefined;
        if (Object.keys(AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        } else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }

        let clientID: number | undefined;
        if (loggedInUser.role === ClientRole.CLIENT) {
            clientID = loggedInUser.id;
        } else if (req.query.client_id) {
            clientID = +req.query.client_id;
        }

        const minified = req.query.minified ? req.query.minified === "true" : undefined;

        const storeID = req.query.store_id ? +req.query.store_id : undefined;

        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }
        let page = 1;
        if (req.query.page && !Number.isNaN(+req.query.page) && +req.query.page > 0) {
            page = +req.query.page;
        }

        const { products, pagesCount } = await productsRepository.getAllProductsPaginated({
            page: page,
            size: size,
            storeID: storeID,
            companyID: companyID,
            minified: minified,
            clientID: clientID
        });

        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: products
        });
    });

    getProduct = catchAsync(async (req, res) => {
        const productID = +req.params.productID;

        const product = await productsRepository.getProduct({
            productID: productID
        });

        res.status(200).json({
            status: "success",
            data: product
        });
    });

    updateProduct = catchAsync(async (req, res) => {
        const productID = +req.params.productID;
        const loggedInUserID = +res.locals.user.id;
        const companyID = +res.locals.user.companyID;

        const productData = ProductUpdateSchema.parse(req.body);

        let image: string | undefined;
        if (req.file) {
            const file = req.file as Express.MulterS3.File;
            image = file.location;
        }

        const product = await productsRepository.updateProduct({
            productID: productID,
            companyID,
            loggedInUserID,
            productData: { ...productData, image }
        });

        res.status(200).json({
            status: "success",
            data: product
        });
    });

    deleteProduct = catchAsync(async (req, res) => {
        const productID = +req.params.productID;

        await productsRepository.deleteProduct({
            productID: productID
        });

        res.status(200).json({
            status: "success"
        });
    });
}
