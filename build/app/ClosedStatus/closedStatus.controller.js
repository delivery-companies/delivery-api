"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLosedStatusController = void 0;
const db_1 = require("../../database/db");
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
class CLosedStatusController {
    createStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const { status, branchId } = req.body;
        const checkIfExist = await db_1.prisma.closedStatus.findFirst({
            where: {
                orderStatus: status,
                branchId: branchId,
            },
        });
        if (checkIfExist) {
            throw new AppError_1.AppError("تم غلق هذه الحاله من قبل", 400);
        }
        const created = await db_1.prisma.closedStatus.create({
            data: {
                orderStatus: status,
                companyId: loggedInUser.companyID,
                branchId: branchId,
            },
        });
        res.status(200).json({
            status: "success",
            created,
        });
    });
    getAllStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { branchId, page, size } = req.query;
        const loggedInUser = res.locals.user;
        const statues = await db_1.prisma.closedStatus.findManyPaginated({
            where: {
                branchId: branchId ? +branchId : undefined,
                companyId: +loggedInUser.companyID,
            },
            select: {
                id: true,
                orderStatus: true,
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                enabled: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }, {
            page: +page,
            size: +size,
        });
        res.status(200).json({
            data: statues.data,
            pagesCount: statues.pagesCount,
        });
    });
    getOneStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const loggedInUser = res.locals.user;
        const status = await db_1.prisma.closedStatus.findFirst({
            where: {
                id: +id,
                companyId: +loggedInUser.companyID,
            },
            select: {
                id: true,
                orderStatus: true,
                branchId: true,
                enabled: true,
            },
        });
        if (!status) {
            throw new AppError_1.AppError("الحالة غير موجودة", 404);
        }
        res.status(200).json({ status: "success", data: status });
    });
    editStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const { status, branchId, enabled } = req.body;
        const loggedInUser = res.locals.user;
        const existing = await db_1.prisma.closedStatus.findFirst({
            where: {
                id: +id,
                companyId: +loggedInUser.companyID,
            },
        });
        if (!existing) {
            throw new AppError_1.AppError("الحالة غير موجودة", 404);
        }
        // Optional check for duplicate status in same branch
        if (status || branchId) {
            const duplicate = await db_1.prisma.closedStatus.findFirst({
                where: {
                    id: { not: +id },
                    orderStatus: status ?? existing.orderStatus,
                    branchId: branchId ?? existing.branchId,
                },
            });
            if (duplicate) {
                throw new AppError_1.AppError("تم غلق هذه الحاله من قبل", 400);
            }
        }
        const updated = await db_1.prisma.closedStatus.update({
            where: { id: +id },
            data: {
                orderStatus: status ?? existing.orderStatus,
                branchId: branchId ?? existing.branchId,
                enabled: typeof enabled === "boolean" ? enabled : existing.enabled,
            },
        });
        res.status(200).json({
            status: "success",
            updated,
        });
    });
    deleteStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const loggedInUser = res.locals.user;
        const existing = await db_1.prisma.closedStatus.findFirst({
            where: {
                id: +id,
                companyId: +loggedInUser.companyID,
            },
        });
        if (!existing) {
            throw new AppError_1.AppError("الحالة غير موجودة", 404);
        }
        await db_1.prisma.closedStatus.delete({
            where: { id: +id },
        });
        res.status(200).json({
            status: "success",
            message: "تم حذف الحالة بنجاح",
        });
    });
}
exports.CLosedStatusController = CLosedStatusController;
//# sourceMappingURL=closedStatus.controller.js.map