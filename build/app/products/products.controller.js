"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
const clients_repository_1 = require("../clients/clients.repository");
const products_dto_1 = require("./products.dto");
const products_repository_1 = require("./products.repository");
const productsRepository = new products_repository_1.ProductsRepository();
const clientsRepository = new clients_repository_1.ClientsRepository();
class ProductsController {
    createProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const productData = products_dto_1.ProductCreateSchema.parse(req.body);
        // const loggedInUserID = +res.locals.user.id;
        const companyID = +res.locals.user.companyID;
        let image;
        if (req.file) {
            const file = req.file;
            image = file.location;
        }
        // Get the clientID
        const clientID = await clientsRepository.getClientIDByStoreID({ storeID: productData.storeID });
        if (!clientID) {
            throw new AppError_1.AppError("حصل حطأ في ايجاد صاحب المتجر", 500);
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
    getAllProducts = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        let clientID;
        if (loggedInUser.role === client_1.ClientRole.CLIENT) {
            clientID = loggedInUser.id;
        }
        else if (req.query.client_id) {
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
    getProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const productID = +req.params.productID;
        const product = await productsRepository.getProduct({
            productID: productID
        });
        res.status(200).json({
            status: "success",
            data: product
        });
    });
    updateProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const productID = +req.params.productID;
        const loggedInUserID = +res.locals.user.id;
        const companyID = +res.locals.user.companyID;
        const productData = products_dto_1.ProductUpdateSchema.parse(req.body);
        let image;
        if (req.file) {
            const file = req.file;
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
    deleteProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const productID = +req.params.productID;
        await productsRepository.deleteProduct({
            productID: productID
        });
        res.status(200).json({
            status: "success"
        });
    });
}
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map