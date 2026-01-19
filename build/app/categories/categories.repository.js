"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesRepository = void 0;
const db_1 = require("../../database/db");
const categories_responses_1 = require("./categories.responses");
class CategoriesRepository {
    async createCategory(clientId, data) {
        const createdCategory = await db_1.prisma.category.create({
            data: {
                title: data.title,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            },
            select: categories_responses_1.categorySelect
        });
        return createdCategory;
    }
    async getAllCategoriesPaginated(filters) {
        const where = {
            client: {
                id: filters.clientId
            }
        };
        if (filters.minified === true) {
            const paginatedCategories = await db_1.prisma.category.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    title: true
                }
            }, {
                page: filters.page,
                size: filters.size
            });
            return { categories: paginatedCategories.data, pagesCount: paginatedCategories.pagesCount };
        }
        const paginatedCategories = await db_1.prisma.category.findManyPaginated({
            where: where,
            orderBy: {
                title: "asc"
            },
            select: categories_responses_1.categorySelect
        }, {
            page: filters.page,
            size: filters.size
        });
        return { categories: paginatedCategories.data, pagesCount: paginatedCategories.pagesCount };
    }
    async getCategory(data) {
        const category = await db_1.prisma.category.findUnique({
            where: {
                id: data.categoryID
            },
            select: categories_responses_1.categorySelect
        });
        return category;
    }
    async updateCategory(data) {
        const category = await db_1.prisma.category.update({
            where: {
                id: data.categoryID
            },
            data: {
                title: data.categoryData.title
            },
            select: categories_responses_1.categorySelect
        });
        return category;
    }
    async deleteCategory(data) {
        await db_1.prisma.category.delete({
            where: {
                id: data.categoryID
            }
        });
        return true;
    }
}
exports.CategoriesRepository = CategoriesRepository;
//# sourceMappingURL=categories.repository.js.map