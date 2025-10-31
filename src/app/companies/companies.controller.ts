import * as bcrypt from "bcrypt";
import { env } from "../../config";
import { AppError } from "../../lib/AppError";
import { catchAsync } from "../../lib/catchAsync";
import type { loggedInUserType } from "../../types/user";
import { EmployeesRepository } from "../employees/employees.repository";
import { CompanyCreateSchema, CompanyUpdateSchema } from "./companies.dto";
import { CompaniesRepository } from "./companies.repository";

const companiesRepository = new CompaniesRepository();
const employeesRepository = new EmployeesRepository();

export class CompaniesController {
    createCompany = catchAsync(async (req, res) => {
        const loggedInUser = res.locals.user as loggedInUserType;
        const companyData = CompanyCreateSchema.parse(req.body);

        let logo: string | undefined;
        if (req.file) {
            const file = req.file as Express.MulterS3.File;
            logo = file.location;
        }

        const hashedPassword = bcrypt.hashSync(
            companyData.companyManager.password + (env.PASSWORD_SALT as string),
            12
        );

        const createdCompany = await companiesRepository.createCompany({
            loggedInUser: loggedInUser,
            companyData: {
                companyData: { ...companyData.companyData, logo },
                companyManager: {
                    ...companyData.companyManager,
                    password: hashedPassword,
                    avatar: logo
                }
            }
        });

        res.status(200).json({
            status: "success",
            data: createdCompany
        });
    });

    getAllCompanies = catchAsync(async (req, res) => {
        const minified = req.query.minified ? req.query.minified === "true" : undefined;

        const mainCompany = req.query.main_company ? req.query.main_company === "true" : undefined;
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }

        let page = 1;
        if (req.query.page && !Number.isNaN(+req.query.page) && +req.query.page > 0) {
            page = +req.query.page;
        }

        const { companies, pagesCount } = await companiesRepository.getAllCompaniesPaginated({
            page: page,
            size: size,
            minified: minified,
            mainCompany: mainCompany
        });

        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: companies
        });
    });

    getCompany = catchAsync(async (req, res) => {
        const companyID = +req.params.companyID;

        const company = await companiesRepository.getCompany({
            companyID: +companyID
        });

        res.status(200).json({
            status: "success",
            data: company
        });
    });

    updateCompany = catchAsync(async (req, res) => {
        const companyID = +req.params.companyID;
        const companyData = CompanyUpdateSchema.parse(req.body);

        let logo: string | undefined;
        if (req.file) {
            const file = req.file as Express.MulterS3.File;
            logo = file.location;
        }

        const companyManagerID = (
            await employeesRepository.getCompanyManager({
                companyID: +companyID
            })
        ).id;
        if (!companyManagerID) {
            throw new AppError("لا يوجد مدير لهذه الشركة", 404);
        }
        companyData.companyManagerID = companyManagerID;

        if (companyData.password) {
            const hashedPassword = bcrypt.hashSync(companyData.password + (env.PASSWORD_SALT as string), 12);
            companyData.password = hashedPassword;
        }

        const company = await companiesRepository.updateCompany({
            companyID: +companyID,
            companyData: { ...companyData, logo }
        });

        res.status(200).json({
            status: "success",
            data: company
        });
    });

    deleteCompany = catchAsync(async (req, res) => {
        const companyID = +req.params.companyID;

        await companiesRepository.deleteCompany({
            companyID: +companyID
        });

        res.status(200).json({
            status: "success"
        });
    });
}
