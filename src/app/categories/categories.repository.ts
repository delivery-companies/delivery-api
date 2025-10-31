import { prisma } from "../../database/db";
import type { CategoryCreateType, CategoryUpdateType } from "./categories.dto";
import { categorySelect } from "./categories.responses";

export class CategoriesRepository {
    async createCategory(clientId:number,data: CategoryCreateType) {
        const createdCategory = await prisma.category.create({
            data: {
                title: data.title,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            },
            select: categorySelect
        });
        return createdCategory;
    }

    async getAllCategoriesPaginated(filters: {
        page: number;
        size: number;
        clientId?: number;
        minified?: boolean;
    }) {
        const where = {
            client: {
                id: filters.clientId
            }
        };

        if (filters.minified === true) {
            const paginatedCategories = await prisma.category.findManyPaginated(
                {
                    where: where,
                    select: {
                        id: true,
                        title: true
                    }
                },
                {
                    page: filters.page,
                    size: filters.size
                }
            );
            return { categories: paginatedCategories.data, pagesCount: paginatedCategories.pagesCount };
        }

        const paginatedCategories = await prisma.category.findManyPaginated(
            {
                where: where,
                orderBy: {
                    title: "asc"
                },
                select: categorySelect
            },
            {
                page: filters.page,
                size: filters.size
            }
        );

        return { categories: paginatedCategories.data, pagesCount: paginatedCategories.pagesCount };
    }

    async getCategory(data: { categoryID: number }) {
        const category = await prisma.category.findUnique({
            where: {
                id: data.categoryID
            },
            select: categorySelect
        });
        return category;
    }

    async updateCategory(data: {
        categoryID: number;
        categoryData: CategoryUpdateType;
    }) {
        const category = await prisma.category.update({
            where: {
                id: data.categoryID
            },
            data: {
                title: data.categoryData.title
            },
            select: categorySelect
        });
        return category;
    }

    async deleteCategory(data: { categoryID: number }) {
        await prisma.category.delete({
            where: {
                id: data.categoryID
            }
        });
        return true;
    }
}
