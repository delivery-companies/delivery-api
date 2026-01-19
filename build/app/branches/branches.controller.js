"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../../lib/catchAsync");
const branches_dto_1 = require("./branches.dto");
const branches_repository_1 = require("./branches.repository");
const branchesRepository = new branches_repository_1.BranchesRepository();
class BranchesController {
    createBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const branchData = branches_dto_1.BranchCreateSchema.parse(req.body);
        const companyID = +res.locals.user.companyID;
        const createdBranch = await branchesRepository.createBranch(companyID, branchData);
        res.status(200).json({
            status: "success",
            data: createdBranch,
        });
    });
    getAllBranches = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        let branchID;
        let getAll;
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        if (req.query.getAll === "true") {
            getAll = true;
        }
        if (loggedInUser.role !== "COMPANY_MANAGER" &&
            !loggedInUser.mainRepository) {
            branchID = loggedInUser.branchId;
        }
        const minified = req.query.minified
            ? req.query.minified === "true"
            : undefined;
        const governorate = req.query.governorate?.toString().toUpperCase();
        const locationID = req.query.location_id
            ? +req.query.location_id
            : undefined;
        // Pagination
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }
        let page = 1;
        if (req.query.page &&
            !Number.isNaN(+req.query.page) &&
            +req.query.page > 0) {
            page = +req.query.page;
        }
        // Query
        const { branches, pagesCount } = await branchesRepository.getAllBranchesPaginated({
            page: page,
            size: size,
            companyID: companyID,
            branchID: branchID,
            governorate: governorate,
            locationID: locationID,
            minified: minified,
            getAll,
        });
        // Response
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: branches,
        });
    });
    getBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const branchID = +req.params.branchID;
        const branch = await branchesRepository.getBranch({
            branchID: branchID,
        });
        res.status(200).json({
            status: "success",
            data: branch,
        });
    });
    updateBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const branchID = +req.params.branchID;
        const branchData = branches_dto_1.BranchUpdateSchema.parse(req.body);
        const branch = await branchesRepository.updateBranch({
            branchID: branchID,
            branchData: branchData,
        });
        res.status(200).json({
            status: "success",
            data: branch,
        });
    });
    deleteBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const branchID = +req.params.branchID;
        await branchesRepository.deleteBranch({
            branchID: branchID,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.BranchesController = BranchesController;
//# sourceMappingURL=branches.controller.js.map