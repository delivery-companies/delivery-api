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
exports.EmployeesService = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("../../config");
const AppError_1 = require("../../lib/AppError");
const branches_repository_1 = require("../branches/branches.repository");
const sendNotification_1 = require("../notifications/helpers/sendNotification");
const employees_repository_1 = require("./employees.repository");
const db_1 = require("../../database/db");
const employeesRepository = new employees_repository_1.EmployeesRepository();
const branchesRepository = new branches_repository_1.BranchesRepository();
class EmployeesService {
    createEmployee = async (data) => {
        let companyID = data.loggedInUser.companyID;
        if (!data.loggedInUser.companyID &&
            (data.loggedInUser.role === client_1.AdminRole.ADMIN ||
                data.loggedInUser.role === client_1.AdminRole.ADMIN_ASSISTANT)) {
            companyID = data.employeeData.companyID;
        }
        if (data.loggedInUser.role !== client_1.EmployeeRole.COMPANY_MANAGER &&
            data.loggedInUser.role !== client_1.EmployeeRole.BRANCH_MANAGER &&
            data.loggedInUser.role !== client_1.AdminRole.ADMIN &&
            data.loggedInUser.role !== client_1.AdminRole.ADMIN_ASSISTANT &&
            data.loggedInUser.role !== client_1.EmployeeRole.CLIENT &&
            data.loggedInUser.role !== client_1.EmployeeRole.CLIENT_ASSISTANT &&
            data.loggedInUser.role !== client_1.EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT &&
            !data.loggedInUser.permissions.includes("MANAGE_EMPLOYEES")) {
            throw new AppError_1.AppError("ليس مصرح لك القيام بهذا الفعل", 403);
        }
        const checkIfUserNameExist = await db_1.prisma.user.findFirst({
            where: {
                username: data.employeeData.username,
            },
            select: {
                id: true,
            },
        });
        if (checkIfUserNameExist) {
            throw new AppError_1.AppError("اسم المستخدم موجود!", 403);
        }
        const hashedPassword = bcrypt.hashSync(data.employeeData.password + config_1.env.PASSWORD_SALT, 12);
        if (data.employeeData.repositoryID) {
            const repository = await db_1.prisma.repository.findFirst({
                where: {
                    id: data.employeeData.repositoryID,
                    branchId: data.employeeData.branchID,
                },
            });
            if (!repository) {
                throw new AppError_1.AppError("هذا المخزن غير مرتبط بالفرع", 404);
            }
        }
        const createdEmployee = await employeesRepository.createEmployee({
            companyID,
            loggedInUser: data.loggedInUser,
            employeeData: {
                ...data.employeeData,
                password: hashedPassword,
            },
        });
        return createdEmployee;
    };
    getAllEmployees = async (data) => {
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(data.loggedInUser.role)) {
            companyID = data.filters.companyID;
        }
        else if (data.loggedInUser.companyID) {
            companyID = data.loggedInUser.companyID;
        }
        // Only show delivery agents from the branch of the logged in branch manager
        let branchID, clientId;
        let roles = data.filters.roles;
        if (data.loggedInUser.role === client_1.EmployeeRole.BRANCH_MANAGER ||
            data.loggedInUser.role === client_1.EmployeeRole.REPOSITORIY_EMPLOYEE) {
            const branch = await branchesRepository.getBranchManagerBranch({
                branchManagerID: data.loggedInUser.id,
            });
            branchID = branch?.id;
            roles = data.filters.roles || ["DELIVERY_AGENT", "RECEIVING_AGENT"];
        }
        else {
            branchID = data.filters.branchID;
        }
        if (data.loggedInUser.role !== "ACCOUNT_MANAGER" &&
            data.loggedInUser.role !== "COMPANY_MANAGER" &&
            !data.loggedInUser.mainRepository) {
            branchID = data.loggedInUser.branchId;
        }
        if (data.loggedInUser.role === "CLIENT") {
            clientId = data.loggedInUser.id;
            branchID = undefined;
        }
        if (data.loggedInUser.role === "CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    clientId: true,
                },
            });
            clientId = employee?.clientId;
        }
        const { employees, pagesCount } = await employeesRepository.getAllEmployeesPaginated({
            loggedInUser: data.loggedInUser,
            filters: { ...data.filters, companyID, branchID, roles, clientId },
        });
        return { employees, pagesCount };
    };
    getEmployee = async (data) => {
        const employee = await employeesRepository.getEmployee({
            employeeID: data.params.employeeID,
        });
        const inD = await db_1.prisma.inquiryEmployeesDeliveryAgents.findMany({
            where: {
                inquiryEmployeeId: data.params.employeeID,
            },
            select: {
                deliveryAgent: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            ...employee,
            inquiryDeliveryAgents: inD.map((deliveryAgent) => {
                return deliveryAgent.deliveryAgent.user;
            }),
        };
    };
    updateEmployee = async (data) => {
        const oldEmployee = await employeesRepository.getEmployee({
            employeeID: data.params.employeeID,
        });
        if (data.employeeData.password) {
            const hashedPassword = bcrypt.hashSync(data.employeeData.password + config_1.env.PASSWORD_SALT, 12);
            data.employeeData.password = hashedPassword;
        }
        if (data.employeeData.repositoryID) {
            const repository = await db_1.prisma.repository.findFirst({
                where: {
                    id: data.employeeData.repositoryID,
                    branchId: data.employeeData.branchID,
                },
            });
            if (!repository) {
                throw new AppError_1.AppError("هذا المخزن غير مرتبط بالفرع", 404);
            }
        }
        const updatedEmployee = await employeesRepository.updateEmployee({
            employeeID: data.params.employeeID,
            // companyID: companyID,
            employeeData: data.employeeData,
        });
        // Send notification to the company manager if the delviery agent name is updated
        if (data.employeeData.name &&
            (updatedEmployee?.role === "DELIVERY_AGENT" ||
                updatedEmployee?.role === "RECEIVING_AGENT") &&
            oldEmployee?.name !== updatedEmployee?.name) {
            // get the company manager id
            const companyManager = await employeesRepository.getCompanyManager({
                companyID: updatedEmployee.company.id,
            });
            await (0, sendNotification_1.sendNotification)({
                userID: companyManager?.id,
                title: "تغيير اسم مندوب",
                content: `تم تغيير اسم المندوب ${oldEmployee?.name} إلى ${updatedEmployee?.name}`,
            });
        }
        return updatedEmployee;
    };
    deleteEmployee = async (data) => {
        await employeesRepository.deleteEmployee({
            employeeID: data.params.employeeID,
        });
    };
    deactivateEmployee = async (data) => {
        await employeesRepository.deactivateEmployee({
            employeeID: data.params.employeeID,
            deletedByID: data.loggedInUser.id,
        });
    };
    reactivateEmployee = async (data) => {
        await employeesRepository.reactivateEmployee({
            employeeID: data.params.employeeID,
        });
    };
}
exports.EmployeesService = EmployeesService;
//# sourceMappingURL=employees.service.js.map