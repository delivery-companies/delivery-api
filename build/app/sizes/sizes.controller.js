"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizesController = void 0;
// import { AdminRole } from "@prisma/client";
const catchAsync_1 = require("../../lib/catchAsync");
// import type { loggedInUserType } from "../../types/user";
const sizes_dto_1 = require("./sizes.dto");
const sizes_repository_1 = require("./sizes.repository");
const stores_repository_1 = require("../stores/stores.repository");
const AppError_1 = require("../../lib/AppError");
const storesRepository = new stores_repository_1.StoresRepository();
const sizesRepository = new sizes_repository_1.SizesRepository();
class SizesController {
    createSize = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const sizeData = sizes_dto_1.SizeCreateSchema.parse(req.body);
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
        const createdSize = await sizesRepository.createSize(clientId, sizeData);
        res.status(200).json({
            status: "success",
            data: createdSize
        });
    });
    getAllSizes = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
        const { sizes, pagesCount } = await sizesRepository.getAllSizesPaginated({
            page: page,
            size: size,
            minified: minified,
            clientId
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: sizes
        });
    });
    getSize = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const sizeID = +req.params.sizeID;
        const size = await sizesRepository.getSize({
            sizeID: sizeID
        });
        res.status(200).json({
            status: "success",
            data: size
        });
    });
    updateSize = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const sizeID = +req.params.sizeID;
        const sizeData = sizes_dto_1.SizeUpdateSchema.parse(req.body);
        const size = await sizesRepository.updateSize({
            sizeID: sizeID,
            sizeData: sizeData
        });
        res.status(200).json({
            status: "success",
            data: size
        });
    });
    deleteSize = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const sizeID = +req.params.sizeID;
        await sizesRepository.deleteSize({
            sizeID: sizeID
        });
        res.status(200).json({
            status: "success"
        });
    });
}
exports.SizesController = SizesController;
//# sourceMappingURL=sizes.controller.js.map