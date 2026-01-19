"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const db_1 = require("../../database/db");
const catchAsync_1 = require("../../lib/catchAsync");
class DepartmentController {
    createDepartment = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const name = req.body.name;
        const loggedInUser = res.locals.user;
        const createdDepartment = await db_1.prisma.department.create({
            data: {
                name: name,
                companyId: loggedInUser.companyID,
                createdBy: loggedInUser.name
            },
            select: {
                id: true,
                name: true,
                companyId: true,
                createdBy: true,
            }
        });
        res.status(200).json({
            status: "success",
            data: createdDepartment
        });
    });
    getAllDepartments = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { page, size } = req.query;
        const loggedInUser = res.locals.user;
        const departments = await db_1.prisma.department.findManyPaginated({
            where: {
                companyId: loggedInUser.companyID
            },
            select: {
                id: true,
                name: true,
                companyId: true,
                createdBy: true,
                employees: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            }
        }, {
            page: page ? +page : 1,
            size: size ? +size : 10
        });
        res.status(200).json({
            status: "success",
            data: departments.data,
            page: departments.currentPage,
            count: departments.dataCount,
            pagesCount: departments.pagesCount
        });
    });
    assignDepartmentsToEmployees = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { departmentId, employeesIds } = req.body;
        let employees = [];
        if (employeesIds) {
            const parsedEmployessIDS = JSON.parse(employeesIds);
            employees = parsedEmployessIDS.map(id => +id);
        }
        await db_1.prisma.employee.updateMany({
            where: {
                departmentId: +departmentId
            },
            data: {
                departmentId: null
            }
        });
        await db_1.prisma.employee.updateMany({
            where: {
                id: { in: employees }
            },
            data: {
                departmentId: +departmentId
            }
        });
        res.status(200).json({
            status: "success",
            message: "Departments assigned to employees successfully"
        });
    });
    getOne = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const department = await db_1.prisma.department.findUnique({
            where: {
                id: +id
            },
            select: {
                id: true,
                name: true,
                companyId: true,
                createdBy: true
            }
        });
        res.status(200).json({
            status: "success",
            data: department
        });
    });
    editOne = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        const department = await db_1.prisma.department.update({
            where: {
                id: +id
            },
            data: {
                name: name
            },
            select: {
                id: true,
                name: true,
                companyId: true,
                createdBy: true
            }
        });
        res.status(200).json({
            status: "success",
            data: department
        });
    });
    deleteOne = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        await db_1.prisma.department.delete({
            where: {
                id: +id
            },
        });
        res.status(204).json({ status: "success" });
    });
}
exports.DepartmentController = DepartmentController;
//# sourceMappingURL=department.controller.js.map