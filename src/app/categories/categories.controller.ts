import { catchAsync } from "../../lib/catchAsync";
// import type { loggedInUserType } from "../../types/user";
import { CategoryCreateSchema, CategoryUpdateSchema } from "./categories.dto";
import { CategoriesRepository } from "./categories.repository";
import { StoresRepository } from "../stores/stores.repository";
import { AppError } from "../../lib/AppError";
import { loggedInUserType } from "../../types/user";

const storesRepository = new StoresRepository();
const categoriesRepository = new CategoriesRepository();

export class CategoriesController {
    createCategory = catchAsync(async (req, res) => {
        const categoryData = CategoryCreateSchema.parse(req.body);
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
        const createdCategory = await categoriesRepository.createCategory(clientId,categoryData);

        res.status(200).json({
            status: "success",
            data: createdCategory
        });
    });

    getAllCategories = catchAsync(async (req, res) => {
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

        const { categories, pagesCount } = await categoriesRepository.getAllCategoriesPaginated({
            page: page,
            size: size,
            minified: minified,
            clientId
        });

        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: categories
        });
    });

    getCategory = catchAsync(async (req, res) => {
        const categoryID = +req.params.categoryID;

        const category = await categoriesRepository.getCategory({
            categoryID: categoryID
        });

        res.status(200).json({
            status: "success",
            data: category
        });
    });

    updateCategory = catchAsync(async (req, res) => {
        const categoryID = +req.params.categoryID;

        const categoryData = CategoryUpdateSchema.parse(req.body);

        const category = await categoriesRepository.updateCategory({
            categoryID: categoryID,
            categoryData: categoryData
        });

        res.status(200).json({
            status: "success",
            data: category
        });
    });

    deleteCategory = catchAsync(async (req, res) => {
        const categoryID = +req.params.categoryID;

        await categoriesRepository.deleteCategory({
            categoryID: categoryID
        });

        res.status(200).json({
            status: "success"
        });
    });
}
