import { prisma } from "../../database/db";
import type { SizeCreateType, SizeUpdateType } from "./sizes.dto";
import { sizeSelect } from "./sizes.responses";

export class SizesRepository {
    async createSize(clientId:number,data: SizeCreateType) {
        const createdSize = await prisma.size.create({
            data: {
                title: data.title,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            },
            select: sizeSelect
        });
        return createdSize;
    }

    async getAllSizesPaginated(filters: {
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
            const paginatedSizes = await prisma.size.findManyPaginated(
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
            return { sizes: paginatedSizes.data, pagesCount: paginatedSizes.pagesCount };
        }

        const paginatedSizes = await prisma.size.findManyPaginated(
            {
                where: where,
                orderBy: {
                    title: "asc"
                },
                select: sizeSelect
            },
            {
                page: filters.page,
                size: filters.size
            }
        );

        return { sizes: paginatedSizes.data, pagesCount: paginatedSizes.pagesCount };
    }

    async getSize(data: { sizeID: number }) {
        const size = await prisma.size.findUnique({
            where: {
                id: data.sizeID
            },
            select: sizeSelect
        });
        return size;
    }

    async updateSize(data: { sizeID: number; sizeData: SizeUpdateType }) {
        const size = await prisma.size.update({
            where: {
                id: data.sizeID
            },
            data: {
                title: data.sizeData.title
            },
            select: sizeSelect
        });
        return size;
    }

    async deleteSize(data: { sizeID: number }) {
        await prisma.size.delete({
            where: {
                id: data.sizeID
            }
        });
        return true;
    }
}
