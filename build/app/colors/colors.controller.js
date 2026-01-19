"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorsController = void 0;
// import { AdminRole } from "@prisma/client";
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
const stores_repository_1 = require("../stores/stores.repository");
// import type { loggedInUserType } from "../../types/user";
const colors_dto_1 = require("./colors.dto");
const colors_repository_1 = require("./colors.repository");
const colorsRepository = new colors_repository_1.ColorsRepository();
const storesRepository = new stores_repository_1.StoresRepository();
class ColorsController {
    createColor = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const colorData = colors_dto_1.ColorCreateSchema.parse(req.body);
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
        const createdColor = await colorsRepository.createColor(clientId, colorData);
        res.status(200).json({
            status: "success",
            data: createdColor
        });
    });
    getAllColors = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
        const { colors, pagesCount } = await colorsRepository.getAllColorsPaginated({
            page: page,
            size: size,
            minified: minified,
            clientId: clientId
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: colors
        });
    });
    getColor = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const colorID = +req.params.colorID;
        const color = await colorsRepository.getColor({
            colorID: colorID
        });
        res.status(200).json({
            status: "success",
            data: color
        });
    });
    updateColor = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const colorID = +req.params.colorID;
        const colorData = colors_dto_1.ColorUpdateSchema.parse(req.body);
        const color = await colorsRepository.updateColor({
            colorID: colorID,
            colorData: colorData
        });
        res.status(200).json({
            status: "success",
            data: color
        });
    });
    deleteColor = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const colorID = +req.params.colorID;
        await colorsRepository.deleteColor({
            colorID: colorID
        });
        res.status(200).json({
            status: "success"
        });
    });
}
exports.ColorsController = ColorsController;
//# sourceMappingURL=colors.controller.js.map