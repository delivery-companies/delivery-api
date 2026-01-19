"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticUpdatesService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../database/db");
const automaticUpdates_responses_1 = require("./automaticUpdates.responses");
class AutomaticUpdatesService {
    async createAutomaticUpdate(data) {
        const createdAutomaticUpdate = await db_1.prisma.automaticUpdate.create({
            data: {
                orderStatus: data.automaticUpdateData.orderStatus,
                returnCondition: data.automaticUpdateData.returnCondition,
                newOrderStatus: data.automaticUpdateData.newOrderStatus,
                notes: data.automaticUpdateData.notes,
                branch: {
                    connect: {
                        id: data.automaticUpdateData.branchID,
                    },
                },
                updateAt: data.automaticUpdateData.updateAt,
                checkAfter: data.automaticUpdateData.checkAfter,
                company: {
                    connect: {
                        id: data.loggedInUser.companyID,
                    },
                },
            },
            select: automaticUpdates_responses_1.automaticUpdateSelect,
        });
        return createdAutomaticUpdate;
    }
    async getAllAutomaticUpdates(data) {
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(data.loggedInUser.role)) {
            companyID = data.filters.companyID;
        }
        else if (data.loggedInUser.companyID) {
            companyID = data.loggedInUser.companyID;
        }
        const where = {
            company: {
                id: companyID,
            },
            orderStatus: data.filters.orderStatus,
            enabled: data.filters.enabled,
            branch: {
                id: data.filters.branchID,
            },
            returnCondition: data.filters.returnCondition,
            newOrderStatus: data.filters.newOrderStatus,
        };
        if (data.filters.minified === true) {
            const paginatedAutomaticUpdates = await db_1.prisma.automaticUpdate.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    orderStatus: true,
                    notes: true,
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }, {
                page: data.filters.page,
                size: data.filters.size,
            });
            return {
                automaticUpdates: paginatedAutomaticUpdates.data,
                automaticUpdatesMetaData: {
                    page: data.filters.page,
                    pagesCount: paginatedAutomaticUpdates.pagesCount,
                },
            };
        }
        const paginatedAutomaticUpdates = await db_1.prisma.automaticUpdate.findManyPaginated({
            where: where,
            orderBy: [
                { orderStatus: "asc" },
                {
                    branch: {
                        name: "asc",
                    },
                },
            ],
            select: automaticUpdates_responses_1.automaticUpdateSelect,
        }, {
            page: data.filters.page,
            size: data.filters.size,
        });
        return {
            automaticUpdates: paginatedAutomaticUpdates.data,
            automaticUpdatesMetaData: {
                page: data.filters.page,
                pagesCount: paginatedAutomaticUpdates.pagesCount,
            },
        };
    }
    async getAutomaticUpdate(data) {
        const automaticUpdate = await db_1.prisma.automaticUpdate.findUnique({
            where: {
                id: data.params.automaticUpdateID,
            },
            select: automaticUpdates_responses_1.automaticUpdateSelect,
        });
        return automaticUpdate;
    }
    async updateAutomaticUpdate(data) {
        const automaticUpdate = await db_1.prisma.automaticUpdate.update({
            where: {
                id: data.params.automaticUpdateID,
            },
            data: {
                orderStatus: data.automaticUpdateData.orderStatus,
                returnCondition: data.automaticUpdateData.returnCondition,
                updateAt: data.automaticUpdateData.updateAt,
                checkAfter: data.automaticUpdateData.checkAfter,
                newOrderStatus: data.automaticUpdateData.newOrderStatus,
                notes: data.automaticUpdateData.notes,
                branch: data.automaticUpdateData.branchID
                    ? {
                        connect: {
                            id: data.automaticUpdateData.branchID,
                        },
                    }
                    : undefined,
                enabled: data.automaticUpdateData.enabled,
            },
            select: automaticUpdates_responses_1.automaticUpdateSelect,
        });
        return automaticUpdate;
    }
    async deleteAutomaticUpdate(data) {
        await db_1.prisma.automaticUpdate.delete({
            where: {
                id: data.params.automaticUpdateID,
            },
        });
    }
}
exports.AutomaticUpdatesService = AutomaticUpdatesService;
//# sourceMappingURL=automaticUpdates.service.js.map