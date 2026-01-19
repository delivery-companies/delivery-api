"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannersRepository = void 0;
const db_1 = require("../../database/db");
const banners_responses_1 = require("./banners.responses");
class BannersRepository {
    async createBanner(companyID, data) {
        const createdBanner = await db_1.prisma.banner.create({
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
            select: banners_responses_1.bannerSelect
        });
        return createdBanner;
    }
    async getAllBannersPaginated(filters) {
        const paginatedBanners = await db_1.prisma.banner.findManyPaginated({
            where: {
                company: {
                    id: filters.companyID
                }
            },
            orderBy: {
                id: "desc"
            },
            select: banners_responses_1.bannerSelect
        }, {
            page: filters.page,
            size: filters.size
        });
        return { banners: paginatedBanners.data, pagesCount: paginatedBanners.pagesCount };
    }
    async getBanner(data) {
        const banner = await db_1.prisma.banner.findUnique({
            where: {
                id: data.bannerID
            },
            select: banners_responses_1.bannerSelect
        });
        return banner;
    }
    async updateBanner(data) {
        const banner = await db_1.prisma.banner.update({
            where: {
                id: data.bannerID
            },
            data: {
                title: data.bannerData.title,
                content: data.bannerData.content,
                image: data.bannerData.image,
                url: data.bannerData.url
            },
            select: banners_responses_1.bannerSelect
        });
        return banner;
    }
    async deleteBanner(data) {
        await db_1.prisma.banner.delete({
            where: {
                id: data.bannerID
            }
        });
        return true;
    }
}
exports.BannersRepository = BannersRepository;
//# sourceMappingURL=banners.repository.js.map