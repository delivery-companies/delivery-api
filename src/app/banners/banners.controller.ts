import { AdminRole } from "@prisma/client";
import { catchAsync } from "../../lib/catchAsync";
import type { loggedInUserType } from "../../types/user";
import { BannerCreateSchema, BannerUpdateSchema } from "./banners.dto";
import { BannersRepository } from "./banners.repository";

const bannersRepository = new BannersRepository();

export class BannersController {
    createBanner = catchAsync(async (req, res) => {
        const bannerData = BannerCreateSchema.parse(req.body);
        const companyID = +res.locals.user.companyID;

        let image: string | undefined;
        if (req.file) {
            const file = req.file as Express.MulterS3.File;
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

    getAllBanners = catchAsync(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user as loggedInUserType;
        let companyID: number | undefined;
        if (Object.keys(AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        } else if (loggedInUser.companyID) {
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

    getBanner = catchAsync(async (req, res) => {
        const bannerID = +req.params.bannerID;

        const banner = await bannersRepository.getBanner({
            bannerID: bannerID
        });

        res.status(200).json({
            status: "success",
            data: banner
        });
    });

    updateBanner = catchAsync(async (req, res) => {
        const bannerID = +req.params.bannerID;

        const bannerData = BannerUpdateSchema.parse(req.body);

        let image: string | undefined;
        if (req.file) {
            const file = req.file as Express.MulterS3.File;
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

    deleteBanner = catchAsync(async (req, res) => {
        const bannerID = +req.params.bannerID;

        await bannersRepository.deleteBanner({
            bannerID: bannerID
        });

        res.status(200).json({
            status: "success"
        });
    });
}
