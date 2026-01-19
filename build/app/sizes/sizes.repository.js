"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizesRepository = void 0;
const db_1 = require("../../database/db");
const sizes_responses_1 = require("./sizes.responses");
class SizesRepository {
    async createSize(clientId, data) {
        const createdSize = await db_1.prisma.size.create({
            data: {
                title: data.title,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            },
            select: sizes_responses_1.sizeSelect
        });
        return createdSize;
    }
    async getAllSizesPaginated(filters) {
        const where = {
            client: {
                id: filters.clientId
            }
        };
        if (filters.minified === true) {
            const paginatedSizes = await db_1.prisma.size.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    title: true
                }
            }, {
                page: filters.page,
                size: filters.size
            });
            return { sizes: paginatedSizes.data, pagesCount: paginatedSizes.pagesCount };
        }
        const paginatedSizes = await db_1.prisma.size.findManyPaginated({
            where: where,
            orderBy: {
                title: "asc"
            },
            select: sizes_responses_1.sizeSelect
        }, {
            page: filters.page,
            size: filters.size
        });
        return { sizes: paginatedSizes.data, pagesCount: paginatedSizes.pagesCount };
    }
    async getSize(data) {
        const size = await db_1.prisma.size.findUnique({
            where: {
                id: data.sizeID
            },
            select: sizes_responses_1.sizeSelect
        });
        return size;
    }
    async updateSize(data) {
        const size = await db_1.prisma.size.update({
            where: {
                id: data.sizeID
            },
            data: {
                title: data.sizeData.title
            },
            select: sizes_responses_1.sizeSelect
        });
        return size;
    }
    async deleteSize(data) {
        await db_1.prisma.size.delete({
            where: {
                id: data.sizeID
            }
        });
        return true;
    }
}
exports.SizesRepository = SizesRepository;
//# sourceMappingURL=sizes.repository.js.map