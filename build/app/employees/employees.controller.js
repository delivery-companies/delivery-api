"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const catchAsync_1 = require("../../lib/catchAsync");
const employees_dto_1 = require("./employees.dto");
const employees_service_1 = require("./employees.service");
const employeesService = new employees_service_1.EmployeesService();
class EmployeesController {
    createEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
        let employeeInput = req.body;
        const loggedInUser = res.locals.user;
        if (req.files) {
            const files = req.files;
            employeeInput = {
                ...req.body,
                avatar: files.avatar ? files.avatar[0].location : undefined,
                idCard: files.idCard ? files.idCard[0].location : undefined,
                residencyCard: files.residencyCard
                    ? files.residencyCard[0].location
                    : undefined,
            };
        }
        const employeeData = employees_dto_1.EmployeeCreateSchema.parse(employeeInput);
        const createdEmployee = await employeesService.createEmployee({
            loggedInUser,
            employeeData: { ...employeeData },
        });
        res.status(200).json({
            status: "success",
            data: createdEmployee,
        });
    });
    getAllEmployees = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const filters = employees_dto_1.EmployeesFiltersSchema.parse({
            minified: req.query.minified,
            roles: req.query.roles,
            permissions: req.query.permissions,
            role: req.query.role,
            name: req.query.name,
            phone: req.query.phone,
            locationID: req.query.location_id,
            branchID: req.query.branch_id,
            ordersStartDate: req.query.orders_start_date,
            ordersEndDate: req.query.orders_end_date,
            deleted: req.query.deleted,
            size: req.query.size,
            page: req.query.page,
            companyID: req.query.company_id,
        });
        const { employees, pagesCount } = await employeesService.getAllEmployees({
            filters,
            loggedInUser,
        });
        res.status(200).json({
            status: "success",
            page: filters.page,
            pagesCount: pagesCount,
            data: employees,
        });
    });
    getEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = {
            employeeID: +req.params.employeeID,
        };
        const employee = await employeesService.getEmployee({
            params,
        });
        res.status(200).json({
            status: "success",
            data: employee,
        });
    });
    updateEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const employeeData = employees_dto_1.EmployeeUpdateSchema.parse(req.body);
        const params = {
            employeeID: +req.params.employeeID,
        };
        if (req.files) {
            const files = req.files;
            employeeData.avatar = files.avatar ? files.avatar[0].location : undefined;
            employeeData.idCard = files.idCard ? files.idCard[0].location : undefined;
            employeeData.residencyCard = files.residencyCard
                ? files.residencyCard[0].location
                : undefined;
        }
        const updatedEmployee = await employeesService.updateEmployee({
            params,
            employeeData: employeeData,
        });
        res.status(200).json({
            status: "success",
            data: { ...updatedEmployee },
        });
    });
    deleteEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = {
            employeeID: +req.params.employeeID,
        };
        await employeesService.deleteEmployee({
            params,
        });
        res.status(200).json({
            status: "success",
        });
    });
    deactivateEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = {
            employeeID: +req.params.employeeID,
        };
        const loggedInUser = res.locals.user;
        await employeesService.deactivateEmployee({
            params,
            loggedInUser: loggedInUser,
        });
        res.status(200).json({
            status: "success",
        });
    });
    reactivateEmployee = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = {
            employeeID: +req.params.employeeID,
        };
        await employeesService.reactivateEmployee({
            params,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.EmployeesController = EmployeesController;
//# sourceMappingURL=employees.controller.js.map