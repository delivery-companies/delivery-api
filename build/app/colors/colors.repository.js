"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorsRepository = void 0;
const db_1 = require("../../database/db");
const colors_responses_1 = require("./colors.responses");
class ColorsRepository {
    async createColor(clientId, data) {
        const createdColor = await db_1.prisma.color.create({
            data: {
                title: data.title,
                code: data.code,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            },
            select: colors_responses_1.colorSelect
        });
        return createdColor;
    }
    async getAllColorsPaginated(filters) {
        const where = {
            client: {
                id: filters.clientId
            }
        };
        if (filters.minified === true) {
            const paginatedColors = await db_1.prisma.color.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    title: true
                }
            }, {
                page: filters.page,
                size: filters.size
            });
            return {
                colors: paginatedColors.data,
                pagesCount: paginatedColors.pagesCount
            };
        }
        const paginatedColors = await db_1.prisma.color.findManyPaginated({
            where: where,
            orderBy: {
                id: "desc"
            },
            select: colors_responses_1.colorSelect
        }, {
            page: filters.page,
            size: filters.size
        });
        return {
            colors: paginatedColors.data,
            pagesCount: paginatedColors.pagesCount
        };
    }
    async getColor(data) {
        const color = await db_1.prisma.color.findUnique({
            where: {
                id: data.colorID
            },
            select: colors_responses_1.colorSelect
        });
        return color;
    }
    async updateColor(data) {
        const color = await db_1.prisma.color.update({
            where: {
                id: data.colorID
            },
            data: {
                title: data.colorData.title,
                code: data.colorData.code
            },
            select: colors_responses_1.colorSelect
        });
        return color;
    }
    async deleteColor(data) {
        await db_1.prisma.color.delete({
            where: {
                id: data.colorID
            }
        });
        return true;
    }
}
exports.ColorsRepository = ColorsRepository;
//# sourceMappingURL=colors.repository.js.map