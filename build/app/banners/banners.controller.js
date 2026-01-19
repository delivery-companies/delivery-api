"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannersController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../../lib/catchAsync");
const banners_dto_1 = require("./banners.dto");
const banners_repository_1 = require("./banners.repository");
const bannersRepository = new banners_repository_1.BannersRepository();
class BannersController {
    createBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const bannerData = banners_dto_1.BannerCreateSchema.parse(req.body);
        const companyID = +res.locals.user.companyID;
        let image;
        if (req.file) {
            const file = req.file;
            image = file.location;
        }
        const createdBanner = await bannersRepository.createBanner(companyID, {
            ...bannerData,
            image
        });
        res.status(200).json({
            status: "success",
            data: createdBanner
        });
    });
    getAllBanners = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        // Pagination
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500) {
            size = 10;
        }
        let page = 1;
        if (req.query.page && !Number.isNaN(+req.query.page) && +req.query.page > 0) {
            page = +req.query.page;
        }
        // Query
        const { banners, pagesCount } = await bannersRepository.getAllBannersPaginated({
            page: page,
            size: size,
            companyID: companyID
        });
        // Response
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: banners
        });
    });
    getBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const bannerID = +req.params.bannerID;
        const banner = await bannersRepository.getBanner({
            bannerID: bannerID
        });
        res.status(200).json({
            status: "success",
            data: banner
        });
    });
    updateBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const bannerID = +req.params.bannerID;
        const bannerData = banners_dto_1.BannerUpdateSchema.parse(req.body);
        let image;
        if (req.file) {
            const file = req.file;
            image = file.location;
        }
        const banner = await bannersRepository.updateBanner({
            bannerID: bannerID,
            bannerData: { ...bannerData, image }
        });
        res.status(200).json({
            status: "success",
            data: banner
        });
    });
    deleteBanner = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const bannerID = +req.params.bannerID;
        await bannersRepository.deleteBanner({
            bannerID: bannerID
        });
        res.status(200).json({
            status: "success"
        });
    });
}
exports.BannersController = BannersController;
//# sourceMappingURL=banners.controller.js.map