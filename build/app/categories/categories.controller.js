"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const catchAsync_1 = require("../../lib/catchAsync");
// import type { loggedInUserType } from "../../types/user";
const categories_dto_1 = require("./categories.dto");
const categories_repository_1 = require("./categories.repository");
const stores_repository_1 = require("../stores/stores.repository");
const AppError_1 = require("../../lib/AppError");
const storesRepository = new stores_repository_1.StoresRepository();
const categoriesRepository = new categories_repository_1.CategoriesRepository();
class CategoriesController {
    createCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const categoryData = categories_dto_1.CategoryCreateSchema.parse(req.body);
        // const companyID = +res.locals.user.companyID;
        let clientId = 0;
        let store = null;
        const { role, id } = res.locals.user;
        if (role === "CLIENT") {
            clientId = +id;
        }
        else if (role === "CLIENT_ASSISTANT") {
            store = await storesRepository.getStoreByClientAssistantId(id);
            clientId = store?.client?.id ?? 0;
        }
        else {
            throw new AppError_1.AppError("لا يوجد فرع مرتبط بالموقع", 500);
        }
        const createdCategory = await categoriesRepository.createCategory(clientId, categoryData);
        res.status(200).json({
            status: "success",
            data: createdCategory
        });
    });
    getAllCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        // const loggedInUser = res.locals.user as loggedInUserType;
        // let companyID: number | undefined;
        // if (Object.keys(AdminRole).includes(loggedInUser.role)) {
        //     companyID = req.query.company_id ? +req.query.company_id : undefined;
        // } else if (loggedInUser.companyID) {
        //     companyID = loggedInUser.companyID;
        // }
        const minified = req.query.minified ? req.query.minified === "true" : undefined;
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }
        let page = 1;
        if (req.query.page && !Number.isNaN(+req.query.page) && +req.query.page > 0) {
            page = +req.query.page;
        }
        let clientId = 0;
        let store = null;
        const { role, id } = res.locals.user;
        if (role === "CLIENT") {
            clientId = +id;
        }
        else if (role === "CLIENT_ASSISTANT") {
            store = await storesRepository.getStoreByClientAssistantId(id);
            clientId = store?.client?.id ?? 0;
        }
        else {
            throw new AppError_1.AppError("لا يوجد فرع مرتبط بالموقع", 500);
        }
        const { categories, pagesCount } = await categoriesRepository.getAllCategoriesPaginated({
            page: page,
            size: size,
            minified: minified,
            clientId
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: categories
        });
    });
    getCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const categoryID = +req.params.categoryID;
        const category = await categoriesRepository.getCategory({
            categoryID: categoryID
        });
        res.status(200).json({
            status: "success",
            data: category
        });
    });
    updateCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const categoryID = +req.params.categoryID;
        const categoryData = categories_dto_1.CategoryUpdateSchema.parse(req.body);
        const category = await categoriesRepository.updateCategory({
            categoryID: categoryID,
            categoryData: categoryData
        });
        res.status(200).json({
            status: "success",
            data: category
        });
    });
    deleteCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const categoryID = +req.params.categoryID;
        await categoriesRepository.deleteCategory({
            categoryID: categoryID
        });
        res.status(200).json({
            status: "success"
        });
    });
}
exports.CategoriesController = CategoriesController;
//# sourceMappingURL=categories.controller.js.map