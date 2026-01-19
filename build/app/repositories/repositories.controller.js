"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoriesController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../../lib/catchAsync");
const repositories_dto_1 = require("./repositories.dto");
const repositories_repository_1 = require("./repositories.repository");
const db_1 = require("../../database/db");
const AppError_1 = require("../../lib/AppError");
const repositoriesRepository = new repositories_repository_1.RepositoriesRepository();
class RepositoriesController {
    createRepository = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const repositoryData = repositories_dto_1.RepositoryCreateSchema.parse(req.body);
        const companyID = +res.locals.user.companyID;
        const repository = await db_1.prisma.repository.findFirst({
            where: {
                branchId: repositoryData.branchID,
                type: repositoryData.type,
            },
            select: {
                id: true,
            },
        });
        if (repository) {
            throw new AppError_1.AppError(repositoryData.type === "EXPORT"
                ? "لقد تم انشاء مخزن صادر لهذا الفرع مسبقا"
                : "لقد تم انشاء مخزن راجع لهذا الفرع مسبقا", 404);
        }
        const createdRepository = await repositoriesRepository.createRepository(companyID, repositoryData);
        res.status(200).json({
            status: "success",
            data: createdRepository,
        });
    });
    getAllRepositories = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const { type } = req.query;
        const loggedInUser = res.locals.user;
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        const minified = req.query.minified
            ? req.query.minified === "true"
            : undefined;
        // Branch manager can only see repositories of his branch
        let branchID = req.query.branchId ? +req.query.branchId : undefined;
        let mainRepository;
        let inquiryBranchesIDs = undefined;
        if (loggedInUser.role === "REPOSITORIY_EMPLOYEE") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: loggedInUser.id,
                },
                select: {
                    inquiryBranches: true,
                },
            });
            inquiryBranchesIDs = employee?.inquiryBranches.length
                ? employee?.inquiryBranches.map((b) => b.branchId)
                : [];
            if (!loggedInUser.mainRepository) {
                mainRepository = true;
            }
        }
        if (loggedInUser.role === "BRANCH_MANAGER" &&
            !loggedInUser.mainRepository &&
            !branchID) {
            mainRepository = true;
        }
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
        const { repositories, pagesCount } = await repositoriesRepository.getAllRepositoriesPaginated({
            page: page,
            size: size,
            companyID: companyID,
            branchID: branchID,
            minified: minified,
            mainRepository,
            type: type,
            inquiryBranchesIDs,
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: repositories,
        });
    });
    getRepository = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const repositoryID = +req.params.repositoryID;
        const repository = await repositoriesRepository.getRepository({
            repositoryID: repositoryID,
        });
        res.status(200).json({
            status: "success",
            data: repository,
        });
    });
    updateRepository = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const repositoryID = +req.params.repositoryID;
        const repositoryData = repositories_dto_1.RepositoryUpdateSchema.parse(req.body);
        const repository = await repositoriesRepository.updateRepository({
            repositoryID: repositoryID,
            repositoryData: repositoryData,
        });
        res.status(200).json({
            status: "success",
            data: repository,
        });
    });
    deleteRepository = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const repositoryID = +req.params.repositoryID;
        await repositoriesRepository.deleteRepository({
            repositoryID: repositoryID,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.RepositoriesController = RepositoriesController;
//# sourceMappingURL=repositories.controller.js.map