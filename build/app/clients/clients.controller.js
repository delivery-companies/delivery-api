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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("../../config");
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
// import { BranchesRepository } from "../branches/branches.repository";
const employees_repository_1 = require("../employees/employees.repository");
const sendNotification_1 = require("../notifications/helpers/sendNotification");
const clients_dto_1 = require("./clients.dto");
const clients_repository_1 = require("./clients.repository");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../database/db");
const clientsRepository = new clients_repository_1.ClientsRepository();
const employeesRepository = new employees_repository_1.EmployeesRepository();
// const branchesRepository = new BranchesRepository();
class ClientsController {
    createClient = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const clientData = clients_dto_1.ClientCreateSchema.parse(req.body);
        let companyID = +res.locals.user.companyID;
        const { password, ...rest } = clientData;
        let avatar;
        if (req.file) {
            const file = req.file;
            avatar = file.location;
        }
        const currentUser = res.locals.user;
        // TODO: CANT CRATE ADMIN_ASSISTANT
        if (!companyID &&
            (currentUser.role === client_1.AdminRole.ADMIN ||
                currentUser.role === client_1.AdminRole.ADMIN_ASSISTANT)) {
            companyID = clientData.companyID;
        }
        // hash the password
        const hashedPassword = bcrypt.hashSync(password + config_1.env.PASSWORD_SALT, 12);
        const createdClient = await clientsRepository.createClient(companyID, {
            ...rest,
            password: hashedPassword,
            userID: currentUser.id,
            avatar,
        });
        res.status(200).json({
            status: "success",
            data: createdClient,
        });
    });
    generateApikey = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.body;
        if (!id) {
            throw new AppError_1.AppError("Client name and permissions are required", 400);
        }
        const client = await clientsRepository.getClient({
            clientID: id,
        });
        if (!client) {
            throw new AppError_1.AppError("Client not found", 404);
        }
        const rawApiKey = `albarq_live_${crypto_1.default.randomBytes(32).toString("hex")}`;
        const apiKeyHash = crypto_1.default
            .createHash("sha256")
            .update(rawApiKey)
            .digest("hex");
        await db_1.prisma.client.update({
            where: {
                id: client.id,
            },
            data: {
                apiKeyHash,
            },
        });
        res.status(200).json({
            status: "success",
            apiKey: rawApiKey,
        });
    });
    getAllClients = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        // Show only clients of the same branch as the logged in user
        let branchID = req.query.branch_id
            ? +req.query.branch_id
            : undefined;
        if (loggedInUser.role !== client_1.EmployeeRole.COMPANY_MANAGER &&
            loggedInUser.role !== client_1.AdminRole.ADMIN &&
            loggedInUser.role !== client_1.AdminRole.ADMIN_ASSISTANT) {
            const employee = await employeesRepository.getEmployee({
                employeeID: loggedInUser.id,
            });
            branchID = employee?.branch?.id;
            // if (!branch) {
            //     throw new AppError("انت غير مرتبط بفرع", 500);
            // }
            // // TODO: Every branch should have a governorate
            // if (!branch.governorate) {
            //     throw new AppError("الفرع الذي تعمل به غير مرتبط بمحافظة", 500);
            // }
        }
        const phone = req.query.phone;
        const name = req.query.name;
        const deleted = req.query.deleted || "false";
        const storeID = req.query.store_id ? +req.query.store_id : undefined;
        const minified = req.query.minified
            ? req.query.minified === "true"
            : undefined;
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
        const { clients, pagesCount } = await clientsRepository.getAllClientsPaginated({
            page: page,
            size: size,
            deleted: deleted,
            companyID: companyID,
            minified: minified,
            storeID: storeID,
            branchID: branchID,
            phone: phone,
            name: name,
            loggedInUser,
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: clients,
        });
    });
    getClient = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const clientID = +req.params.clientID;
        const loggedInUser = res.locals.user;
        if (loggedInUser.role === client_1.ClientRole.CLIENT ||
            loggedInUser.role === client_1.EmployeeRole.CLIENT_ASSISTANT) {
            if (clientID !== loggedInUser.id) {
                throw new AppError_1.AppError("غير مصرح لك الاطلاع علي بيانات عميل اخر", 403);
            }
        }
        const client = await clientsRepository.getClient({
            clientID: clientID,
        });
        res.status(200).json({
            status: "success",
            data: client,
        });
    });
    updateClient = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const clientData = clients_dto_1.ClientUpdateSchema.parse(req.body);
        const clientID = +req.params.clientID;
        // const companyID = +res.locals.user.companyID;
        let avatar;
        if (req.file) {
            const file = req.file;
            avatar = file.location;
        }
        const oldClient = await clientsRepository.getClient({
            clientID: clientID,
        });
        const { password, ...rest } = clientData;
        // hash the password
        const hashedPassword = bcrypt.hashSync(password + config_1.env.PASSWORD_SALT, 12);
        const updatedClient = await clientsRepository.updateClient({
            clientID: clientID,
            // companyID: companyID,
            clientData: {
                ...rest,
                password: clientData.password ? hashedPassword : undefined,
                avatar,
            },
        });
        // Send notification to the company manager if the client name is updated
        if (clientData.name && oldClient?.name !== updatedClient?.name) {
            // get the company manager id
            const companyManager = await employeesRepository.getCompanyManager({
                companyID: updatedClient?.company.id,
            });
            await (0, sendNotification_1.sendNotification)({
                userID: companyManager?.id,
                title: "تغيير اسم عميل",
                content: `تم تغيير اسم العميل ${oldClient?.name} إلى ${updatedClient?.name}`,
            });
        }
        res.status(200).json({
            status: "success",
            data: updatedClient,
        });
    });
    deleteClient = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const clientID = +req.params.clientID;
        await clientsRepository.deleteClient({
            clientID: clientID,
        });
        res.status(200).json({
            status: "success",
        });
    });
    deactivateClient = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const clientID = +req.params.clientID;
        const loggedInUserID = +res.locals.user.id;
        await clientsRepository.deactivateClient({
            clientID: clientID,
            deletedByID: loggedInUserID,
        });
        res.status(200).json({
            status: "success",
        });
    });
    reactivateClient = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const clientID = +req.params.clientID;
        await clientsRepository.reactivateClient({
            clientID: clientID,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.ClientsController = ClientsController;
//# sourceMappingURL=clients.controller.js.map