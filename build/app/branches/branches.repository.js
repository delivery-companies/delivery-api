"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesRepository = void 0;
const db_1 = require("../../database/db");
const branches_responses_1 = require("./branches.responses");
class BranchesRepository {
    async createBranch(companyID, data) {
        const createdBranch = await db_1.prisma.branch.create({
            data: {
                name: data.name,
                governorate: data.governorate,
                company: {
                    connect: {
                        id: companyID,
                    },
                },
            },
            select: branches_responses_1.branchSelect,
        });
        return createdBranch;
    }
    async getAllBranchesPaginated(filters) {
        const where = {
            id: filters.getAll
                ? undefined
                : filters.branchID
                    ? filters.branchID
                    : undefined,
            company: {
                id: filters.companyID,
            },
            governorate: filters.governorate,
            locations: filters.locationID
                ? {
                    some: {
                        id: filters.locationID,
                    },
                }
                : undefined,
        };
        if (filters.minified === true) {
            const paginatedBranches = await db_1.prisma.branch.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    name: true,
                },
            }, {
                page: 1,
                size: 10000,
            });
            return {
                branches: paginatedBranches.data,
                pagesCount: paginatedBranches.pagesCount,
            };
        }
        const paginatedBranches = await db_1.prisma.branch.findManyPaginated({
            where: where,
            orderBy: {
                name: "asc",
            },
            select: branches_responses_1.branchSelect,
        }, {
            page: filters.page,
            size: filters.size,
        });
        return {
            branches: paginatedBranches.data,
            pagesCount: paginatedBranches.pagesCount,
        };
    }
    async getBranch(data) {
        const branch = await db_1.prisma.branch.findUnique({
            where: {
                id: data.branchID,
            },
            select: branches_responses_1.branchSelect,
        });
        return branch;
    }
    async updateBranch(data) {
        const branch = await db_1.prisma.branch.update({
            where: {
                id: data.branchID,
            },
            data: {
                name: data.branchData.name,
                governorate: data.branchData.governorate,
            },
            select: branches_responses_1.branchSelect,
        });
        return branch;
    }
    async deleteBranch(data) {
        await db_1.prisma.branch.delete({
            where: {
                id: data.branchID,
            },
        });
        return true;
    }
    async getBranchManagerBranch(data) {
        const branch = await db_1.prisma.branch.findFirst({
            where: {
                employees: {
                    some: {
                        id: data.branchManagerID,
                    },
                },
            },
            select: {
                id: true,
                governorate: true,
            },
        });
        return branch;
    }
    async getBranchByLocation(data) {
        const branch = await db_1.prisma.branch.findFirst({
            where: {
                locations: {
                    some: {
                        id: data.locationID,
                    },
                },
            },
            select: branches_responses_1.branchSelect,
        });
        return branch;
    }
}
exports.BranchesRepository = BranchesRepository;
//# sourceMappingURL=branches.repository.js.map