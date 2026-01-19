"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticUpdatesController = void 0;
const catchAsync_1 = require("../../lib/catchAsync");
const automaticUpdates_dto_1 = require("./automaticUpdates.dto");
const automaticUpdates_service_1 = require("./automaticUpdates.service");
const automaticUpdatesService = new automaticUpdates_service_1.AutomaticUpdatesService();
class AutomaticUpdatesController {
    createAutomaticUpdate = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const automaticUpdateData = automaticUpdates_dto_1.AutomaticUpdateCreateSchema.parse(req.body);
        const loggedInUser = res.locals.user;
        const createdAutomaticUpdate = await automaticUpdatesService.createAutomaticUpdate({
            loggedInUser,
            automaticUpdateData,
        });
        res.status(200).json({
            status: "success",
            data: createdAutomaticUpdate,
        });
    });
    getAllAutomaticUpdates = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const filters = automaticUpdates_dto_1.AutomaticUpdatesFiltersSchema.parse({
            companyID: req.query.company_id,
            size: req.query.size,
            page: req.query.page,
            minified: req.query.minified,
            enabled: req.query.enabled,
            orderStatus: req.query.order_status,
            returnCondition: req.query.return_condition,
            newOrderStatus: req.query.new_order_status,
            branchID: req.query.branch_id,
        });
        const { automaticUpdates, automaticUpdatesMetaData } = await automaticUpdatesService.getAllAutomaticUpdates({
            loggedInUser: loggedInUser,
            filters: filters,
        });
        res.status(200).json({
            status: "success",
            page: automaticUpdatesMetaData.page,
            pagesCount: automaticUpdatesMetaData.pagesCount,
            data: automaticUpdates,
        });
    });
    getAutomaticUpdate = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = {
            automaticUpdateID: +req.params.automaticUpdateID,
        };
        const automaticUpdate = await automaticUpdatesService.getAutomaticUpdate({
            params: params,
        });
        res.status(200).json({
            status: "success",
            data: automaticUpdate,
        });
    });
    updateAutomaticUpdate = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const automaticUpdateData = automaticUpdates_dto_1.AutomaticUpdateUpdateSchema.parse(req.body);
        const params = {
            automaticUpdateID: +req.params.automaticUpdateID,
        };
        const automaticUpdate = await automaticUpdatesService.updateAutomaticUpdate({
            params: params,
            automaticUpdateData: automaticUpdateData,
        });
        res.status(200).json({
            status: "success",
            data: automaticUpdate,
        });
    });
    deleteAutomaticUpdate = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = {
            automaticUpdateID: +req.params.automaticUpdateID,
        };
        await automaticUpdatesService.deleteAutomaticUpdate({
            params: params,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.AutomaticUpdatesController = AutomaticUpdatesController;
//# sourceMappingURL=automaticUpdates.controller.js.map