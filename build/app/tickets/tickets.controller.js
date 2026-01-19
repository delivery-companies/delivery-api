"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const db_1 = require("../../database/db");
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
const employees_repository_1 = require("../employees/employees.repository");
const zod_1 = __importDefault(require("zod"));
// import { orderSelect } from "../orders/orders.responses";
const ticketSelect = {
    id: true,
    clientId: true,
    companyId: true,
    closed: true,
    forwarded: true,
    content: true,
    Department: {
        select: {
            id: true,
            name: true,
        },
    },
    Employee: {
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    Order: {
        select: {
            receiptNumber: true,
            status: true,
            secondaryStatus: true,
            recipientPhones: true,
            recipientAddress: true,
            governorate: true,
            location: {
                select: {
                    id: true,
                    name: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
            client: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
            deliveryAgent: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
    },
    createdBy: {
        select: {
            id: true,
            name: true,
        },
    },
    ticketResponse: {
        select: {
            id: true,
            content: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    Client: {
        select: {
            showNumbers: true,
            showDeliveryNumber: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
    },
};
const TicketCreateSchema = zod_1.default.object({
    content: zod_1.default.string(),
});
const employeesRepository = new employees_repository_1.EmployeesRepository();
class TicketController {
    createTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { content, orderId } = req.body;
        const loggedInUser = res.locals.user;
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: {
                id: true,
                clientId: true,
                status: true,
                deliveryAgentId: true,
            },
        });
        if (!order) {
            throw new AppError_1.AppError("لا يوجد طلب", 404);
        }
        const ticket = await db_1.prisma.ticket.create({
            data: {
                content: content,
                orderId: orderId,
                clientId: order.clientId,
                createdById: loggedInUser.id,
                companyId: loggedInUser.companyID,
                createdByRole: loggedInUser.role,
            },
            select: {
                id: true,
            },
        });
        res.status(200).json({
            status: "success",
            data: ticket,
        });
    });
    getAllTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const { forwarded, closed, status, page, size, userTickets } = req.query;
        // Inquiry Employee Filters
        let inquiryGovernorates = undefined;
        let inquiryLocationsIDs = undefined;
        let inquiryBranchesIDs = undefined;
        let inquiryStoresIDs = undefined;
        let inquiryStatuses = undefined;
        if (loggedInUser.role === "INQUIRY_EMPLOYEE") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: loggedInUser.id,
            });
            if (inquiryEmployeeStuff) {
                // if all filters are empty, that means he shouldnt see any orders
                inquiryStatuses =
                    inquiryEmployeeStuff.inquiryStatuses &&
                        inquiryEmployeeStuff.inquiryStatuses.length > 0
                        ? inquiryEmployeeStuff.inquiryStatuses
                        : undefined;
                inquiryGovernorates =
                    inquiryEmployeeStuff.inquiryGovernorates &&
                        inquiryEmployeeStuff.inquiryGovernorates.length > 0
                        ? inquiryEmployeeStuff.inquiryGovernorates
                        : undefined;
                inquiryLocationsIDs =
                    inquiryEmployeeStuff.inquiryLocations &&
                        inquiryEmployeeStuff.inquiryLocations.length > 0
                        ? inquiryEmployeeStuff.inquiryLocations
                        : undefined;
                inquiryBranchesIDs =
                    inquiryEmployeeStuff.inquiryBranches &&
                        inquiryEmployeeStuff.inquiryBranches.length > 0
                        ? inquiryEmployeeStuff.inquiryBranches
                        : undefined;
                inquiryStoresIDs =
                    inquiryEmployeeStuff.inquiryStores &&
                        inquiryEmployeeStuff.inquiryStores.length > 0
                        ? inquiryEmployeeStuff.inquiryStores
                        : undefined;
            }
        }
        const employee = await db_1.prisma.employee.findUnique({
            where: {
                id: loggedInUser.id,
            },
            select: {
                departmentId: true,
                branchId: true,
            },
        });
        if (loggedInUser.role === "BRANCH_MANAGER" ||
            loggedInUser.role === "REPOSITORIY_EMPLOYEE") {
            inquiryBranchesIDs = [];
            inquiryBranchesIDs.push(employee?.branchId || 0);
        }
        let forward;
        let close;
        if (forwarded && forwarded === "true") {
            forward = true;
        }
        else if (forwarded && forwarded === "false") {
            forward = false;
        }
        else
            forward = undefined;
        if (closed && closed === "true") {
            close = true;
        }
        else if (closed && closed === "false") {
            close = false;
        }
        else
            close = undefined;
        const tickets = await db_1.prisma.ticket.findManyPaginated({
            where: {
                AND: [
                    { companyId: loggedInUser.companyID },
                    {
                        employeeId: userTickets === "true"
                            ? loggedInUser.id
                            : (loggedInUser.role === "INQUIRY_EMPLOYEE" &&
                                close === false) ||
                                forward === true
                                ? null
                                : loggedInUser.role === "INQUIRY_EMPLOYEE" && close === true
                                    ? loggedInUser.id
                                    : undefined,
                    },
                    {
                        clientId: loggedInUser.role === "CLIENT" ? loggedInUser.id : undefined,
                    },
                    {
                        forwarded: userTickets === "true" ||
                            (loggedInUser.role === "INQUIRY_EMPLOYEE" && close === true) ||
                            loggedInUser.role === "CLIENT"
                            ? undefined
                            : forward,
                    },
                    {
                        departmentId: userTickets === "true"
                            ? undefined
                            : forward && loggedInUser.role === "INQUIRY_EMPLOYEE"
                                ? employee?.departmentId
                                : undefined,
                    },
                    { closed: forward === true ? false : close },
                    {
                        Order: {
                            status: status
                                ? status
                                : inquiryStatuses
                                    ? { in: inquiryStatuses }
                                    : undefined,
                            deliveryAgentId: loggedInUser.role === "DELIVERY_AGENT"
                                ? loggedInUser.id
                                : undefined,
                            governorate: inquiryGovernorates && forward === false
                                ? {
                                    in: inquiryGovernorates,
                                }
                                : undefined,
                            branch: inquiryBranchesIDs && forward === false
                                ? {
                                    id: {
                                        in: inquiryBranchesIDs,
                                    },
                                }
                                : loggedInUser.role === "BRANCH_MANAGER" ||
                                    loggedInUser.role === "REPOSITORIY_EMPLOYEE"
                                    ? {
                                        id: {
                                            in: inquiryBranchesIDs,
                                        },
                                    }
                                    : undefined,
                            store: inquiryStoresIDs && forward === false
                                ? {
                                    id: {
                                        in: inquiryStoresIDs,
                                    },
                                }
                                : undefined,
                            location: inquiryLocationsIDs && forward === false
                                ? {
                                    id: {
                                        in: inquiryLocationsIDs,
                                    },
                                }
                                : undefined,
                        },
                    },
                ],
            },
            select: ticketSelect,
            orderBy: {
                id: "desc",
            },
        }, {
            page: page ? +page : 1,
            size: size ? +size : 10,
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: tickets.pagesCount,
            count: tickets.dataCount,
            data: tickets.data,
        });
    });
    closeTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const loggedInUser = res.locals.user;
        const { content } = TicketCreateSchema.parse(req.body);
        const ticket = await db_1.prisma.ticket.update({
            where: {
                id: +id,
            },
            data: {
                closed: true,
            },
        });
        await db_1.prisma.ticketResponse.create({
            data: {
                ticketId: +id,
                content: content,
                createdById: loggedInUser.id,
            },
        });
        res.status(200).json({
            status: "success",
            data: ticket,
        });
    });
    takeTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const loggedInUser = res.locals.user;
        const ticket = await db_1.prisma.ticket.findUnique({
            where: {
                id: +id,
            },
            select: {
                id: true,
                employeeId: true,
            },
        });
        if (ticket?.employeeId) {
            throw new AppError_1.AppError("لا يمكنك استلام هذه التذكره", 404);
        }
        const updatedticket = await db_1.prisma.ticket.update({
            where: {
                id: +id,
            },
            data: {
                Employee: {
                    connect: {
                        id: loggedInUser.id,
                    },
                },
            },
        });
        res.status(200).json({
            status: "success",
            data: updatedticket,
        });
    });
    forwardTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const loggedInUser = res.locals.user;
        const ticket = await db_1.prisma.ticket.findUnique({
            where: {
                id: +id,
            },
            select: {
                id: true,
                employeeId: true,
            },
        });
        if (loggedInUser.role === "INQUIRY_EMPLOYEE" &&
            ticket?.employeeId !== loggedInUser.id) {
            throw new AppError_1.AppError("لا يمكنك تحويل هذه التذكره", 404);
        }
        console.log(req.body);
        const updatedTicket = await db_1.prisma.ticket.update({
            where: {
                id: +id,
            },
            data: {
                departmentId: +req.body.departmentId,
                employeeId: null,
                forwarded: true,
            },
        });
        res.status(200).json({
            status: "success",
            data: updatedTicket,
        });
    });
    getOne = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const ticket = await db_1.prisma.ticket.findUnique({
            where: {
                id: +id,
            },
            select: ticketSelect,
        });
        res.status(200).json({
            status: "success",
            data: ticket,
        });
    });
    createResponse = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const { ticketId, content } = req.body;
        const ticket = await db_1.prisma.ticket.findUnique({
            where: {
                id: +ticketId,
            },
            select: {
                id: true,
                employeeId: true,
            },
        });
        if (loggedInUser.role === "INQUIRY_EMPLOYEE" &&
            ticket?.employeeId !== loggedInUser.id) {
            throw new AppError_1.AppError("لا يمكنك الرد علي هذه التذكره", 404);
        }
        const ticketResponse = await db_1.prisma.ticketResponse.create({
            data: {
                ticketId: +ticketId,
                content: content,
                createdById: loggedInUser.id,
            },
        });
        res.status(201).json({
            status: "success",
            data: ticketResponse,
        });
    });
}
exports.TicketController = TicketController;
//# sourceMappingURL=tickets.controller.js.map