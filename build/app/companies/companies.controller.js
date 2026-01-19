"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("../../config");
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
const employees_repository_1 = require("../employees/employees.repository");
const companies_dto_1 = require("./companies.dto");
const companies_repository_1 = require("./companies.repository");
const companiesRepository = new companies_repository_1.CompaniesRepository();
const employeesRepository = new employees_repository_1.EmployeesRepository();
class CompaniesController {
    createCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const companyData = companies_dto_1.CompanyCreateSchema.parse(req.body);
        let logo;
        if (req.file) {
            const file = req.file;
            logo = file.location;
        }
        const hashedPassword = bcrypt.hashSync(companyData.companyManager.password + config_1.env.PASSWORD_SALT, 12);
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
    getAllCompanies = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
    getCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const companyID = +req.params.companyID;
        const company = await companiesRepository.getCompany({
            companyID: +companyID
        });
        res.status(200).json({
            status: "success",
            data: company
        });
    });
    updateCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const companyID = +req.params.companyID;
        const companyData = companies_dto_1.CompanyUpdateSchema.parse(req.body);
        let logo;
        if (req.file) {
            const file = req.file;
            logo = file.location;
        }
        const companyManagerID = (await employeesRepository.getCompanyManager({
            companyID: +companyID
        })).id;
        if (!companyManagerID) {
            throw new AppError_1.AppError("لا يوجد مدير لهذه الشركة", 404);
        }
        companyData.companyManagerID = companyManagerID;
        if (companyData.password) {
            const hashedPassword = bcrypt.hashSync(companyData.password + config_1.env.PASSWORD_SALT, 12);
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
    deleteCompany = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const companyID = +req.params.companyID;
        await companiesRepository.deleteCompany({
            companyID: +companyID
        });
        res.status(200).json({
            status: "success"
        });
    });
}
exports.CompaniesController = CompaniesController;
//# sourceMappingURL=companies.controller.js.map