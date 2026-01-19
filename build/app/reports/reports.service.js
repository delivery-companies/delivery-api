"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../lib/AppError");
// import { OrderTimelineType } from "../orders/orders.dto";
const localize_1 = require("../../lib/localize");
const clients_repository_1 = require("../clients/clients.repository");
const employees_repository_1 = require("../employees/employees.repository");
const sendNotification_1 = require("../notifications/helpers/sendNotification");
const orders_repository_1 = require("../orders/orders.repository");
const generateReport_1 = require("./helpers/generateReport");
const generateReportsReport_1 = require("./helpers/generateReportsReport");
const reports_repository_1 = require("./reports.repository");
const db_1 = require("../../database/db");
const reportsRepository = new reports_repository_1.ReportsRepository();
const ordersRepository = new orders_repository_1.OrdersRepository();
const employeesRepository = new employees_repository_1.EmployeesRepository();
const clientsRepository = new clients_repository_1.ClientsRepository();
class ReportsService {
    async createReport(data) {
        let orders;
        let ordersIDs = [];
        if (data.reportData.ordersIDs === "*") {
            orders = (await ordersRepository.getAllOrdersPaginated({
                filters: { ...data.ordersFilters, size: 5000 },
                loggedInUser: data.loggedInUser,
            })).orders;
            for (const order of orders) {
                if (order) {
                    ordersIDs.push(order.id);
                }
            }
        }
        else {
            orders = await ordersRepository.getOrdersByIDs({
                ordersIDs: data.reportData.ordersIDs,
            });
            ordersIDs = data.reportData.ordersIDs;
        }
        //  orders = await ordersRepository.getOrdersByIDs(data.reportData);
        if (!orders || orders.length === 0) {
            throw new AppError_1.AppError("لا يوجد طلبات لعمل الكشف", 400);
        }
        // Check if orders are not in another report
        if (data.reportData.type === client_1.ReportType.CLIENT) {
            for (const order of orders) {
                const returnedReport = order?.clientReport.find((r) => r.secondaryType === "RETURNED");
                const deliveredReport = order?.clientReport.find((r) => r.secondaryType === "DELIVERED");
                if (deliveredReport &&
                    deliveredReport.deleted !== true &&
                    data.reportData.secondaryType === "DELIVERED") {
                    throw new AppError_1.AppError(`الطلب ${order?.receiptNumber} يوجد في كشف عملاء واصل اخر رقمه ${deliveredReport.id}`, 400);
                }
                if (returnedReport &&
                    returnedReport.deleted !== true &&
                    data.reportData.secondaryType === "RETURNED") {
                    throw new AppError_1.AppError(`الطلب ${order?.receiptNumber} يوجد في كشف عملاء راجع اخر رقمه ${returnedReport.id}`, 400);
                }
            }
        }
        else if (data.reportData.type === client_1.ReportType.REPOSITORY) {
            for (const order of orders) {
                const returnedReport = order?.repositoryReport.find((r) => r.secondaryType === "RETURNED");
                const deliveredReport = order?.clientReport.find((r) => r.secondaryType === "DELIVERED");
                if (deliveredReport &&
                    deliveredReport.deleted !== true &&
                    data.reportData.secondaryType === "DELIVERED") {
                    throw new AppError_1.AppError(`الطلب ${order?.receiptNumber} يوجد في كشف مخازن واصل اخر رقمه ${deliveredReport.id}`, 400);
                }
                if (returnedReport &&
                    returnedReport.deleted !== true &&
                    data.reportData.secondaryType === "RETURNED") {
                    throw new AppError_1.AppError(`الطلب ${order?.receiptNumber} يوجد في كشف مخازن راجع اخر رقمه ${returnedReport.id}`, 400);
                }
            }
        }
        else if (data.reportData.type === client_1.ReportType.GOVERNORATE) {
            for (const order of orders) {
                if (order?.governorateReport &&
                    order?.governorateReport.deleted !== true) {
                    throw new AppError_1.AppError(`الطلب ${order.receiptNumber} يوجد في كشف محافظة اخر رقمه ${order.governorateReport.id}`, 400);
                }
            }
        }
        else if (data.reportData.type === client_1.ReportType.DELIVERY_AGENT) {
            for (const order of orders) {
                if (order?.deliveryAgentReport &&
                    order?.deliveryAgentReport.deleted !== true) {
                    throw new AppError_1.AppError(`الطلب ${order.receiptNumber} يوجد في كشف مندوبين اخر رقمه ${order.deliveryAgentReport.id}`, 400);
                }
            }
        }
        else if (data.reportData.type === client_1.ReportType.COMPANY) {
            for (const order of orders) {
                const returnedReport = order?.companyReport.find((r) => r.secondaryType === "RETURNED");
                const deliveredReport = order?.companyReport.find((r) => r.secondaryType === "DELIVERED");
                if (deliveredReport &&
                    deliveredReport.deleted !== true &&
                    data.reportData.secondaryType === "DELIVERED") {
                    throw new AppError_1.AppError(`الطلب ${order?.receiptNumber} يوجد في كشف شركة واصل اخر رقمه ${deliveredReport.id}`, 400);
                }
                if (returnedReport &&
                    returnedReport.deleted !== true &&
                    data.reportData.secondaryType === "RETURNED") {
                    throw new AppError_1.AppError(`الطلب ${order?.receiptNumber} يوجد في كشف شركة راجع اخر رقمه ${returnedReport.id}`, 400);
                }
            }
        }
        const company = await db_1.prisma.company.findUnique({
            where: {
                id: data.loggedInUser.companyID || 0,
            },
            select: {
                baghdadPrice: true,
                governoratePrice: true,
                deliveryAgentFee: true,
            },
        });
        // Change orders costs reportData contains new costs
        if (data.reportData.type === client_1.ReportType.CLIENT ||
            data.reportData.type === client_1.ReportType.BRANCH ||
            data.reportData.type === client_1.ReportType.GOVERNORATE) {
            await ordersRepository.updateOrdersCosts({
                ordersIDs,
                costs: {
                    baghdadDeliveryCost: data.reportData.baghdadDeliveryCost,
                    governoratesDeliveryCost: data.reportData.governoratesDeliveryCost,
                    reportType: data.reportData.type,
                },
            });
            orders = await ordersRepository.getOrdersByIDs({ ordersIDs });
        }
        if (data.reportData.type === client_1.ReportType.COMPANY) {
            await ordersRepository.updateOrdersCosts({
                ordersIDs,
                costs: {
                    baghdadDeliveryCost: data.reportData.baghdadDeliveryCost || company?.baghdadPrice,
                    governoratesDeliveryCost: data.reportData.governoratesDeliveryCost ||
                        company?.governoratePrice,
                },
            });
            orders = await ordersRepository.getOrdersByIDs({ ordersIDs });
        }
        if (data.reportData.type === client_1.ReportType.DELIVERY_AGENT) {
            await ordersRepository.updateOrdersCosts({
                ordersIDs,
                costs: {
                    deliveryAgentDeliveryCost: data.reportData.deliveryAgentDeliveryCost ||
                        company?.deliveryAgentFee,
                },
            });
            orders = await ordersRepository.getOrdersByIDs({ ordersIDs });
        }
        const reportMetaData = {
            baghdadOrdersCount: 0,
            governoratesOrdersCount: 0,
            totalCost: 0,
            paidAmount: 0,
            deliveryCost: 0,
            clientNet: 0,
            deliveryAgentNet: 0,
            companyNet: 0,
            branchNet: 0,
        };
        let insideOrdersCount = 0;
        let total = 0;
        let baghdadTotal = 0;
        let otherTotal = 0;
        let insideTotal = 0;
        for (const order of orders) {
            // @ts-expect-error Fix later
            reportMetaData.totalCost += +order.totalCost;
            // @ts-expect-error Fix later
            reportMetaData.paidAmount += +order.paidAmount;
            // @ts-expect-error Fix later
            reportMetaData.deliveryCost += +order.deliveryCost;
            // @ts-expect-error Fix later
            reportMetaData.clientNet += +order.clientNet;
            // @ts-expect-error Fix later
            reportMetaData.branchNet += +order.branchNet;
            // @ts-expect-error Fix later
            reportMetaData.deliveryAgentNet += order.deliveryAgentNet;
            // @ts-expect-error Fix later
            reportMetaData.companyNet += +order.companyNet;
            // @ts-expect-error Fix later
            if (order.governorate === "BAGHDAD") {
                reportMetaData.baghdadOrdersCount++;
            }
            else {
                reportMetaData.governoratesOrdersCount++;
            }
        }
        // Get client id from store id if report type is client
        let clientID;
        if (data.reportData.type === client_1.ReportType.CLIENT) {
            clientID = await clientsRepository.getClientIDByStoreID({
                storeID: data.reportData.storeID,
            });
        }
        const report = await reportsRepository.createReport({
            loggedInUser: data.loggedInUser,
            reportData: data.reportData.type === client_1.ReportType.CLIENT
                ? { ...data.reportData, ordersIDs, clientID }
                : { ...data.reportData, ordersIDs },
            type: data.ordersFilters.orderType || undefined,
            reportMetaData: reportMetaData,
        });
        if (!report) {
            throw new AppError_1.AppError("حدث خطأ اثناء عمل الكشف", 500);
        }
        const reportData = await reportsRepository.getReport({
            reportID: report.id,
        });
        if (!reportData) {
            throw new AppError_1.AppError("حدث خطأ اثناء عمل الكشف", 500);
        }
        // Send notification to client if report type is client report
        if (data.reportData.type === client_1.ReportType.CLIENT) {
            await (0, sendNotification_1.sendNotification)({
                title: data.reportData.secondaryType === "RETURNED"
                    ? "تم انشاء كشف راجع جديد"
                    : "تم انشاء كشف واصل جديد",
                content: data.reportData.secondaryType === "RETURNED"
                    ? `تم انشاء كشف راجع جديد برقم ${reportData?.id}`
                    : `تم انشاء كشف واصل جديد برقم ${reportData?.id}`,
                userID: reportData?.clientReport?.client.id,
            });
        }
        // Send notification to delivery agent if report type is delivery agent report
        if (data.reportData.type === client_1.ReportType.DELIVERY_AGENT) {
            await (0, sendNotification_1.sendNotification)({
                title: "تم انشاء كشف مندوب جديد",
                content: `تم انشاء كشف جديد برقم ${reportData?.id}`,
                userID: reportData?.deliveryAgentReport?.deliveryAgent.id,
            });
        }
        // update orders timeline
        for (const order of orders) {
            if (!order) {
                continue;
            }
            if (reportData?.type === "CLIENT" &&
                reportData.clientReport?.branch?.id === order?.branch?.id) {
                insideOrdersCount += 1;
            }
            total += order?.clientNet || 0;
            if (reportData?.type === "CLIENT" &&
                reportData.clientReport?.branch?.id === order?.branch?.id) {
                insideOrdersCount += 1;
                insideTotal += order?.clientNet || 0;
            }
            if (reportData?.type === "CLIENT" && order?.governorate === "BAGHDAD") {
                baghdadTotal += order?.clientNet;
            }
            if (reportData?.type === "CLIENT" && order?.governorate !== "BAGHDAD") {
                otherTotal += order?.clientNet || 0;
            }
            await ordersRepository.updateOrderTimeline({
                orderID: order.id,
                data: {
                    type: "REPORT_CREATE",
                    date: reportData?.createdAt,
                    old: null,
                    new: {
                        id: reportData?.id,
                        type: reportData?.type,
                    },
                    by: {
                        id: data.loggedInUser.id,
                        name: data.loggedInUser.name,
                    },
                    message: `تم انشاء كشف ${(0, localize_1.localizeReportType)(reportData?.type)} برقم ${reportData?.id}`,
                },
            });
        }
        reportData.insideOrdersCount = insideOrdersCount;
        reportData.total = total;
        reportData.insideTotal = insideTotal;
        reportData.baghdadTotal = baghdadTotal;
        reportData.otherTotal = otherTotal;
        const pdf = await (0, generateReport_1.generateReport)(data.reportData.type, reportData, orders);
        return pdf;
    }
    async getAllReports(data) {
        let company;
        if (Object.keys(client_1.AdminRole).includes(data.loggedInUser.role)) {
            company = data.filters.company ? +data.filters.company : undefined;
        }
        else if (data.loggedInUser.companyID) {
            company = data.loggedInUser.companyID;
        }
        // Only show reports of the same branch as the employee
        let branch;
        if ((data.filters.type === client_1.ReportType.CLIENT ||
            data.filters.type === client_1.ReportType.REPOSITORY ||
            data.filters.type === client_1.ReportType.DELIVERY_AGENT) &&
            data.loggedInUser.role !== client_1.EmployeeRole.COMPANY_MANAGER &&
            data.loggedInUser.role !== client_1.AdminRole.ADMIN &&
            data.loggedInUser.role !== client_1.AdminRole.ADMIN_ASSISTANT &&
            data.loggedInUser.role !== client_1.ClientRole.CLIENT &&
            data.loggedInUser.role !== client_1.EmployeeRole.CLIENT_ASSISTANT) {
            const employee = await employeesRepository.getEmployee({
                employeeID: data.loggedInUser.id,
            });
            if (!employee?.repository?.mainRepository) {
                branch = employee?.branch?.id;
            }
            if (employee?.repository?.type === "RETURN") {
                data.filters.secondaryType = "RETURNED";
            }
            else if (employee?.repository?.type === "EXPORT") {
                data.filters.secondaryType = "DELIVERED";
            }
        }
        else if (data.filters.branch) {
            branch = +data.filters.branch;
        }
        else {
            branch = undefined;
        }
        let clientID;
        if (data.loggedInUser.role === "CLIENT") {
            clientID = +data.loggedInUser.id;
        }
        else if (data.filters.clientID) {
            clientID = +data.filters.clientID;
        }
        else if (data.loggedInUser.role === "CLIENT_ASSISTANT") {
            clientID = +data.loggedInUser.clientId;
        }
        else {
            clientID = undefined;
        }
        let deliveryAgentID;
        if (data.loggedInUser.role === client_1.EmployeeRole.DELIVERY_AGENT) {
            deliveryAgentID = +data.loggedInUser.id;
        }
        else if (data.filters.deliveryAgentID) {
            deliveryAgentID = +data.filters.deliveryAgentID;
        }
        else {
            deliveryAgentID = undefined;
        }
        let size = data.filters.size ? +data.filters.size : 10;
        if (size > 500 && data.filters.minified !== true) {
            size = 10;
        }
        let page = 1;
        if (data.filters.page &&
            !Number.isNaN(+data.filters.page) &&
            +data.filters.page > 0) {
            page = +data.filters.page;
        }
        if (data.loggedInUser.role === "RECEIVING_AGENT") {
            return {
                page: 1,
                pagesCount: 1,
                reports: [],
                reportsMetaData: {},
            };
        }
        const { reports, reportsMetaData, pagesCount } = await reportsRepository.getAllReportsPaginated({
            filters: {
                ...data.filters,
                company,
                branch,
                clientID,
                deliveryAgentID,
                size,
            },
        });
        return { page, pagesCount, reports, reportsMetaData };
    }
    async getReport(data) {
        const report = await reportsRepository.getReport({
            reportID: data.params.reportID,
        });
        if (report?.deleted) {
            throw new AppError_1.AppError("الكشف المطلوب موجود بسلة المحذوفات", 404);
        }
        return report;
    }
    async getReportPDF(data) {
        const reportData = await reportsRepository.getReport({
            reportID: data.params.reportID,
        });
        if (!reportData) {
            throw new AppError_1.AppError("الكشف المطلوب غير موجود", 404);
        }
        if (reportData?.deleted) {
            throw new AppError_1.AppError("الكشف المطلوب موجود بسلة المحذوفات", 404);
        }
        // ===== Permission check =====
        const user = data.loggedInUser;
        if (user && user.role !== "COMPANY_MANAGER" && !user.mainRepository) {
            const isSameBranch = reportData.createdByBrachId === user.branchId;
            const type = reportData.type;
            if ((type === "CLIENT" && !isSameBranch) ||
                (type === "DELIVERY_AGENT" && !isSameBranch) ||
                (type === "BRANCH" &&
                    reportData.branchReport?.branch.id !== user.branchId)) {
                throw new AppError_1.AppError("غير مصرح لك بالاطلاع علي هذا الكشف", 400);
            }
        }
        // ========= Extract orders ==========
        // TODO: fix this
        // @ts-expect-error Fix later
        const orders = reportData.repositoryReport?.repositoryReportOrders ??
            reportData.branchReport?.branchReportOrders ??
            reportData.clientReport?.clientReportOrders ??
            reportData.deliveryAgentReport?.deliveryAgentReportOrders ??
            reportData.governorateReport?.governorateReportOrders ??
            reportData.companyReport?.companyReportOrders ??
            [];
        if (orders.length === 0) {
            throw new AppError_1.AppError("لا يوجد طلبات", 404);
        }
        const ordersIDs = orders.map((o) => o.id);
        // ========= Fetch orders data ==========
        let ordersData = await ordersRepository.getOrdersByIDs({
            ordersIDs,
        });
        // ========= Fetch all timelines in one query ==========
        const timelines = await db_1.prisma.orderTimeline.findMany({
            where: {
                type: "PAID_AMOUNT_CHANGE",
                orderId: { in: ordersIDs },
            },
        });
        // ========= Group timelines by order ==========
        const timelineMap = timelines.reduce((acc, t) => {
            const id = Number(t.orderId);
            if (!acc[id])
                acc[id] = [];
            acc[id].push(t);
            return acc;
        }, {});
        // Sort each timeline list descending by date (fastest access)
        Object.values(timelineMap).forEach((list) => list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        // ========= Pre-calculate reusable variables ==========
        const type = reportData.type;
        const createdAt = reportData.createdAt;
        const branchId = reportData.clientReport?.branch?.id;
        const baghdadCost = (type === "CLIENT" && reportData.clientReport?.baghdadDeliveryCost) ||
            (type === "BRANCH" && reportData.branchReport?.baghdadDeliveryCost) ||
            0;
        const governorateCost = (type === "CLIENT" &&
            reportData.clientReport?.governoratesDeliveryCost) ||
            (type === "BRANCH" &&
                reportData.branchReport?.governoratesDeliveryCost) ||
            0;
        const deliveryBaseCost = type === "DELIVERY_AGENT"
            ? reportData.deliveryAgentReport?.deliveryAgentDeliveryCost || 0
            : 0;
        // ========= Accumulators ==========
        let insideOrdersCount = 0;
        let total = 0;
        let insideTotal = 0;
        let baghdadTotal = 0;
        let otherTotal = 0;
        // ========= Process all orders FAST ==========
        for (const order of ordersData) {
            if (!order)
                continue;
            const paidBefore = order.paidAmount || 0;
            let newPaidAmount = paidBefore;
            // ==== Find latest paidAmountChange AFTER report created ====
            const tList = timelineMap[order.id];
            if (tList && tList.length) {
                const latest = tList.find((t) => t.createdAt > createdAt);
                if (latest) {
                    const val = JSON.parse(latest.old?.toString() || "{}");
                    if (val.value !== undefined)
                        newPaidAmount = Number(val.value);
                }
            }
            // ==== Update net amounts only once ====
            order.paidAmount = newPaidAmount;
            if (type === "CLIENT") {
                if (order.governorate === "BAGHDAD") {
                    order.clientNet = newPaidAmount - order.deliveryCost;
                    total += newPaidAmount - order.deliveryCost;
                    baghdadTotal += newPaidAmount - order.deliveryCost;
                    if (branchId === order.branch?.id) {
                        insideOrdersCount++;
                        insideTotal += newPaidAmount - order.deliveryCost;
                    }
                }
                else {
                    order.clientNet = newPaidAmount - order.deliveryCost;
                    otherTotal += newPaidAmount - order.deliveryCost;
                    total += newPaidAmount - order.deliveryCost;
                    if (branchId === order.branch?.id) {
                        insideOrdersCount++;
                        insideTotal += newPaidAmount - order.deliveryCost;
                    }
                }
            }
            if (type === "BRANCH") {
                if (order.governorate === "BAGHDAD")
                    order.branchNet = newPaidAmount - baghdadCost;
                else
                    order.branchNet = newPaidAmount - governorateCost;
            }
            if (type === "DELIVERY_AGENT") {
                const weightCost = (order.weight || 0) * 250;
                const deliveryNet = deliveryBaseCost + weightCost;
                order.deliveryAgentNet = deliveryNet;
                order.companyNet = newPaidAmount - deliveryNet;
            }
        }
        // ========= Assign totals to reportData ==========
        reportData.insideOrdersCount = insideOrdersCount;
        reportData.total = total;
        reportData.insideTotal = insideTotal;
        reportData.baghdadTotal = baghdadTotal;
        reportData.otherTotal = otherTotal;
        // ========= Generate PDF ==========
        const pdf = await (0, generateReport_1.generateReport)(reportData.type, reportData, ordersData);
        return pdf;
    }
    async getReportsReportPDF(data) {
        let reports;
        let reportsIDs = [];
        if (data.reportsData.reportsIDs === "*") {
            reports = (await reportsRepository.getAllReportsPaginated({
                filters: {
                    ...data.reportsFilters,
                    type: data.reportsData.type,
                    size: 5000,
                },
            })).reports;
            for (const report of reports) {
                if (report) {
                    reportsIDs.push(report.id);
                }
            }
        }
        else {
            reports = await reportsRepository.getReportsByIDs({
                reportsIDs: data.reportsData.reportsIDs,
            });
            reportsIDs = data.reportsData.reportsIDs;
        }
        if (!reports || reports.length === 0) {
            throw new AppError_1.AppError("لا يوجد كشوفات لعمل التقرير", 400);
        }
        if (data.reportsData.type === "CLIENT") {
            const reportsData = {
                company: reports[0]?.company,
                companyNet: reports.reduce((acc, report) => {
                    if (report) {
                        return acc + report.companyNet;
                    }
                    return acc;
                }, 0),
                clientNet: reports.reduce((acc, report) => {
                    if (report) {
                        return acc + report.clientNet;
                    }
                    return acc;
                }, 0),
                baghdadOrdersCount: reports.reduce((acc, report) => {
                    if (report) {
                        return acc + (report.baghdadOrdersCount || 0);
                    }
                    return acc;
                }, 0),
                governoratesOrdersCount: reports.reduce((acc, report) => {
                    if (report) {
                        return acc + (report.governoratesOrdersCount || 0);
                    }
                    return acc;
                }, 0),
                date: new Date(),
                count: reports.length,
            };
            const pdf = await (0, generateReportsReport_1.generateReportsReport)(data.reportsData.type, reportsData, reports);
            return pdf;
        }
        throw new AppError_1.AppError("لا يمكن عمل تقرير لهذا النوع من التقارير", 400);
    }
    async updateReport(data) {
        if (data.reportData.confirmed === false &&
            (data.loggedInUser.role === "CLIENT" ||
                data.loggedInUser.role === "CLIENT_ASSISTANT")) {
            throw new AppError_1.AppError("لا يمكنك إلغاء تأكيد التقرير", 400);
        }
        const report = await reportsRepository.updateReport({
            reportID: data.params.reportID,
            reportData: data.reportData,
        });
        return report;
    }
    async deleteReport(data) {
        await reportsRepository.deleteReport({
            reportID: data.params.reportID,
        });
    }
    async deactivateReport(data) {
        const report = await reportsRepository.deactivateReport({
            reportID: data.params.reportID,
            deletedByID: data.loggedInUser.id,
        });
        const orders = report?.type === client_1.ReportType.CLIENT
            ? report.clientReport?.clientReportOrders
            : report?.type === client_1.ReportType.REPOSITORY
                ? report?.repositoryReport?.repositoryReportOrders
                : report?.type === client_1.ReportType.BRANCH
                    ? report?.branchReport?.branchReportOrders
                    : report?.type === client_1.ReportType.GOVERNORATE
                        ? report?.governorateReport?.governorateReportOrders
                        : report?.type === client_1.ReportType.DELIVERY_AGENT
                            ? report?.deliveryAgentReport?.deliveryAgentReportOrders
                            : report?.type === client_1.ReportType.COMPANY
                                ? report?.companyReport?.companyReportOrders
                                : [];
        if (orders) {
            for (const order of orders) {
                await ordersRepository.updateOrderTimeline({
                    orderID: order.id,
                    data: {
                        type: "REPORT_DELETE",
                        date: report?.updatedAt || new Date(),
                        old: {
                            id: data.params.reportID,
                            type: report?.type,
                        },
                        new: null,
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: `تم حذف كشف ${(0, localize_1.localizeReportType)(report?.type)} برقم ${data.params.reportID}`,
                    },
                });
            }
        }
        // Send notification to client if report type is client report
        if (report?.type === client_1.ReportType.CLIENT) {
            await (0, sendNotification_1.sendNotification)({
                title: report.clientReport?.secondaryType === "RETURNED"
                    ? "تم حذف كشف راجع "
                    : "تم حذف كشف واصل ",
                content: `تم حذف الكشف برقم ${report.id}`,
                userID: report.clientReport?.client.id,
            });
        }
        // Send notification to delivery agent if report type is delivery agent report
        if (report?.type === client_1.ReportType.DELIVERY_AGENT) {
            await (0, sendNotification_1.sendNotification)({
                title: "تم حذف كشف",
                content: `تم حذف الكشف برقم ${report.id}`,
                userID: report.deliveryAgentReport?.deliveryAgent.id,
            });
        }
    }
    async reactivateReport(data) {
        const report = await reportsRepository.reactivateReport({
            reportID: data.params.reportID,
        });
        // Send notification to client if report type is client report
        if (report?.type === client_1.ReportType.CLIENT) {
            await (0, sendNotification_1.sendNotification)({
                title: "تم استعادة كشف",
                content: `تم استعادة الكشف برقم ${report.id}`,
                userID: report.clientReport?.client.id,
            });
        }
        // Send notification to delivery agent if report type is delivery agent report
        if (report?.type === client_1.ReportType.DELIVERY_AGENT) {
            await (0, sendNotification_1.sendNotification)({
                title: "تم استعادة كشف",
                content: `تم استعادة الكشف برقم ${report.id}`,
                userID: report.deliveryAgentReport?.deliveryAgent.id,
            });
        }
    }
}
exports.ReportsService = ReportsService;
//# sourceMappingURL=reports.service.js.map