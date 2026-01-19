"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../../lib/catchAsync");
const stores_dto_1 = require("./stores.dto");
const stores_repository_1 = require("./stores.repository");
const employees_repository_1 = require("../employees/employees.repository");
const db_1 = require("../../database/db");
const storesRepository = new stores_repository_1.StoresRepository();
const employeesRepository = new employees_repository_1.EmployeesRepository();
class StoresController {
    createStore = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const storeData = stores_dto_1.StoreCreateSchema.parse(req.body);
        const companyID = +res.locals.user.companyID;
        let logo;
        if (req.file) {
            const file = req.file;
            logo = file.location;
        }
        const createdStore = await storesRepository.createStore(companyID, {
            ...storeData,
            logo,
        });
        res.status(200).json({
            status: "success",
            data: createdStore,
        });
    });
    getAllStores = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        let name;
        let inquiryStoresIDs = undefined;
        if (req.query.name) {
            name = req.query.name + "";
        }
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        let clientID;
        if (loggedInUser.role === client_1.ClientRole.CLIENT) {
            clientID = loggedInUser.id;
        }
        else if (req.query.client_id) {
            clientID = +req.query.client_id;
        }
        let clientAssistantID = req.query.client_assistant_id
            ? +req.query.client_assistant_id
            : undefined;
        // if (loggedInUser.role === EmployeeRole.CLIENT_ASSISTANT) {
        //   clientAssistantID = loggedInUser.id;
        // }
        if (loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT" ||
            loggedInUser.role === "CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        // Show only stores of the same branch as the logged in user
        let branchID = req.query.branch_id
            ? +req.query.branch_id
            : undefined;
        if (loggedInUser.role !== client_1.EmployeeRole.COMPANY_MANAGER &&
            loggedInUser.role !== client_1.AdminRole.ADMIN &&
            loggedInUser.role !== client_1.AdminRole.ADMIN_ASSISTANT) {
            const employee = await employeesRepository.getEmployee({
                employeeID: loggedInUser.id,
            });
            if (!loggedInUser.mainRepository) {
                branchID = employee?.branch?.id;
            }
        }
        const minified = req.query.minified
            ? req.query.minified === "true"
            : undefined;
        const deleted = req.query.deleted || "false";
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }
        let page = 1;
        if (req.query.page &&
            !Number.isNaN(+req.query.page) &&
            +req.query.page > 0) {
            page = +req.query.page;
        }
        const { stores, pagesCount } = await storesRepository.getAllStoresPaginated({
            page: page,
            size: size,
            deleted: deleted,
            clientID,
            clientAssistantID,
            companyID: companyID,
            minified: minified,
            branchID: branchID,
            name: name,
            inquiryStoresIDs,
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: stores,
        });
    });
    getAllClientStores = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        let name;
        if (req.query.name) {
            name = req.query.name + "";
        }
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        let clientID;
        clientID = loggedInUser.id;
        const deleted = "false";
        const { stores } = await storesRepository.getAllClientStoresPaginated({
            deleted: deleted,
            clientID,
            companyID: companyID,
            name: name,
        });
        res.status(200).json({
            status: "success",
            data: stores,
        });
    });
    getStore = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const storeID = +req.params.storeID;
        const store = await storesRepository.getStore({
            storeID: storeID,
        });
        res.status(200).json({
            status: "success",
            data: store,
        });
    });
    updateStore = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const storeID = +req.params.storeID;
        let logo;
        if (req.file) {
            const file = req.file;
            logo = file.location;
        }
        const storeData = stores_dto_1.StoreUpdateSchema.parse(req.body);
        const store = await storesRepository.updateStore({
            storeID: storeID,
            storeData: { ...storeData, logo },
        });
        res.status(200).json({
            status: "success",
            data: store,
        });
    });
    deleteStore = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const storeID = +req.params.storeID;
        await storesRepository.deleteStore({
            storeID: storeID,
        });
        res.status(200).json({
            status: "success",
        });
    });
    deactivateStore = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const storeID = +req.params.storeID;
        const loggedInUserID = +res.locals.user.id;
        await storesRepository.deactivateStore({
            storeID: storeID,
            deletedByID: loggedInUserID,
        });
        res.status(200).json({
            status: "success",
        });
    });
    reactivateStore = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const storeID = +req.params.storeID;
        await storesRepository.reactivateStore({
            storeID: storeID,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.StoresController = StoresController;
//# sourceMappingURL=stores.controller.js.map