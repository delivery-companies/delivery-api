// import { AdminRole } from "@prisma/client";
import { catchAsync } from "../../lib/catchAsync";
// import type { loggedInUserType } from "../../types/user";
import { SizeCreateSchema, SizeUpdateSchema } from "./sizes.dto";
import { SizesRepository } from "./sizes.repository";
import { StoresRepository } from "../stores/stores.repository";
import { AppError } from "../../lib/AppError";
import { loggedInUserType } from "../../types/user";

const storesRepository = new StoresRepository();
const sizesRepository = new SizesRepository();

export class SizesController {
    createSize = catchAsync(async (req, res) => {
        const sizeData = SizeCreateSchema.parse(req.body);
        // const companyID = +res.locals.user.companyID;
       let clientId=0
        let store=null
        const { role , id } = res.locals.user as loggedInUserType;

        if(role === "CLIENT"){
            clientId = +id
        }else if(role === "CLIENT_ASSISTANT"){
            store=await storesRepository.getStoreByClientAssistantId(id)
            clientId= store?.client?.id ?? 0
        }else{
            throw new AppError("لا يوجد فرع مرتبط بالموقع", 500);
             
        }

        const createdSize = await sizesRepository.createSize(clientId,sizeData);

        res.status(200).json({
            status: "success",
            data: createdSize
        });
    });

    getAllSizes = catchAsync(async (req, res) => {
        // Filters
        // const loggedInUser = res.locals.user as loggedInUserType;
        // let companyID: number | undefined;
        // if (Object.keys(AdminRole).includes(loggedInUser.role)) {
        //     companyID = req.query.company_id ? +req.query.company_id : undefined;
        // } else if (loggedInUser.companyID) {
        //     companyID = loggedInUser.companyID;
        // }

        const minified = req.query.minified ? req.query.minified === "true" : undefined;

        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }
        let page = 1;
        if (req.query.page && !Number.isNaN(+req.query.page) && +req.query.page > 0) {
            page = +req.query.page;
        }

        let clientId=0
        let store=null
        const { role , id } = res.locals.user as loggedInUserType;

        if(role === "CLIENT"){
            clientId = +id
        }else if(role === "CLIENT_ASSISTANT"){
            store=await storesRepository.getStoreByClientAssistantId(id)
            clientId= store?.client?.id ?? 0
        }else{
            throw new AppError("لا يوجد فرع مرتبط بالموقع", 500);
             
        }

        const { sizes, pagesCount } = await sizesRepository.getAllSizesPaginated({
            page: page,
            size: size,
            minified: minified,
            clientId
        });

        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: sizes
        });
    });

    getSize = catchAsync(async (req, res) => {
        const sizeID = +req.params.sizeID;

        const size = await sizesRepository.getSize({
            sizeID: sizeID
        });

        res.status(200).json({
            status: "success",
            data: size
        });
    });

    updateSize = catchAsync(async (req, res) => {
        const sizeID = +req.params.sizeID;

        const sizeData = SizeUpdateSchema.parse(req.body);

        const size = await sizesRepository.updateSize({
            sizeID: sizeID,
            sizeData: sizeData
        });

        res.status(200).json({
            status: "success",
            data: size
        });
    });

    deleteSize = catchAsync(async (req, res) => {
        const sizeID = +req.params.sizeID;

        await sizesRepository.deleteSize({
            sizeID: sizeID
        });

        res.status(200).json({
            status: "success"
        });
    });
}
