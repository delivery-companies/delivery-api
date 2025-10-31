import { prisma } from "../../database/db";
import type { ColorCreateType, ColorUpdateType } from "./colors.dto";
import { colorSelect } from "./colors.responses";

export class ColorsRepository {
    async createColor(clientId:number,data: ColorCreateType) {
        const createdColor = await prisma.color.create({
            data: {
                title: data.title,
                code: data.code,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            },
            select: colorSelect
        });
        return createdColor;
    }

    async getAllColorsPaginated(filters: {
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
            const paginatedColors = await prisma.color.findManyPaginated(
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
            return {
                colors: paginatedColors.data,
                pagesCount: paginatedColors.pagesCount
            };
        }

        const paginatedColors = await prisma.color.findManyPaginated(
            {
                where: where,
                orderBy: {
                    id: "desc"
                },
                select: colorSelect
            },
            {
                page: filters.page,
                size: filters.size
            }
        );

        return {
            colors: paginatedColors.data,
            pagesCount: paginatedColors.pagesCount
        };
    }

    async getColor(data: { colorID: number }) {
        const color = await prisma.color.findUnique({
            where: {
                id: data.colorID
            },
            select: colorSelect
        });
        return color;
    }

    async updateColor(data: { colorID: number; colorData: ColorUpdateType }) {
        const color = await prisma.color.update({
            where: {
                id: data.colorID
            },
            data: {
                title: data.colorData.title,
                code: data.colorData.code
            },
            select: colorSelect
        });
        return color;
    }

    async deleteColor(data: { colorID: number }) {
        await prisma.color.delete({
            where: {
                id: data.colorID
            }
        });
        return true;
    }
}
