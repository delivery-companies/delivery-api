import { prisma } from "../../database/db";
import type { BannerCreateType, BannerUpdateType } from "./banners.dto";
import { bannerSelect } from "./banners.responses";

export class BannersRepository {
    async createBanner(companyID: number, data: BannerCreateType) {
        const createdBanner = await prisma.banner.create({
            data: {
                title: data.title,
                content: data.content,
                image: data.image,
                url: data.url,
                company: {
                    connect: {
                        id: companyID
                    }
                }
            },
            select: bannerSelect
        });
        return createdBanner;
    }

    async getAllBannersPaginated(filters: {
        page: number;
        size: number;
        companyID?: number;
    }) {
        const paginatedBanners = await prisma.banner.findManyPaginated(
            {
                where: {
                    company: {
                        id: filters.companyID
                    }
                },
                orderBy: {
                    id: "desc"
                },
                select: bannerSelect
            },
            {
                page: filters.page,
                size: filters.size
            }
        );
        return { banners: paginatedBanners.data, pagesCount: paginatedBanners.pagesCount };
    }

    async getBanner(data: { bannerID: number }) {
        const banner = await prisma.banner.findUnique({
            where: {
                id: data.bannerID
            },
            select: bannerSelect
        });
        return banner;
    }

    async updateBanner(data: {
        bannerID: number;
        bannerData: BannerUpdateType;
    }) {
        const banner = await prisma.banner.update({
            where: {
                id: data.bannerID
            },
            data: {
                title: data.bannerData.title,
                content: data.bannerData.content,
                image: data.bannerData.image,
                url: data.bannerData.url
            },
            select: bannerSelect
        });
        return banner;
    }

    async deleteBanner(data: { bannerID: number }) {
        await prisma.banner.delete({
            where: {
                id: data.bannerID
            }
        });
        return true;
    }
}
