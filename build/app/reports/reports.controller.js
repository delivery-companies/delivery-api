"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const catchAsync_1 = require("../../lib/catchAsync");
const reports_dto_1 = require("./reports.dto");
const reports_service_1 = require("./reports.service");
const reportsService = new reports_service_1.ReportsService();
class ReportController {
    createReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const reportData = reports_dto_1.ReportCreateSchema.parse(req.body);
        const loggedInUser = res.locals.user;
        const ordersFilters = reports_dto_1.ReportCreateOrdersFiltersSchema.parse({
            type: reportData.type,
            clientID: req.query.client_id,
            deliveryAgentID: req.query.delivery_agent_id,
            companyID: req.query.company_id,
            sort: "branchId:asc",
            page: req.query.page,
            size: req.query.size,
            startDate: req.query.start_date,
            endDate: req.query.end_date,
            governorate: req.query.governorate,
            statuses: req.query.statuses,
            status: req.query.status,
            deliveryType: req.query.delivery_type,
            storeID: req.query.store_id,
            repositoryID: req.query.repository_id,
            branchID: req.query.branch_id,
            clientReport: req.query.client_report,
            repositoryReport: req.query.repository_report,
            branchReport: req.query.branch_report,
            deliveryAgentReport: req.query.delivery_agent_report,
            governorateReport: req.query.governorate_report,
            companyReport: req.query.company_report,
            minified: false,
            confirmed: req.query.confirmed,
            delivered: req.query.delivered,
            orderType: req.query.orderType,
        });
        const pdf = await reportsService.createReport({
            loggedInUser,
            reportData,
            ordersFilters,
        });
        const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
        // Set headers for a PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
        console.log("PDF size:", pdfBuffer.length);
        res.send(pdfBuffer);
    });
    getAllReports = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const filters = reports_dto_1.ReportsFiltersSchema.parse({
            page: req.query.page,
            size: req.query.size,
            company: req.query.company,
            branch: req.query.branch,
            sort: req.query.sort,
            startDate: req.query.start_date,
            endDate: req.query.end_date,
            governorate: req.query.governorate,
            status: req.query.status,
            type: req.query.type,
            types: req.query.types,
            storeID: req.query.store_id,
            repositoryID: req.query.repository_id,
            branchID: req.query.branch_id,
            deliveryAgentID: req.query.delivery_agent_id,
            companyID: req.query.company_id,
            clientID: req.query.client_id,
            createdByID: req.query.created_by_id,
            deleted: req.query.deleted,
            minified: req.query.minified,
            secondaryType: req.query.secondaryReportType,
        });
        if (loggedInUser.role === "INQUIRY_EMPLOYEE" ||
            loggedInUser.role === "RECEIVING_AGENT" ||
            loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT" ||
            (loggedInUser.role === "CLIENT_ASSISTANT" &&
                !loggedInUser.permissions.includes("MANAGE_REPORTS"))) {
            res.status(200).json({
                status: "success",
                page: 1,
                pagesCount: 1,
                data: {
                    reports: [],
                    reportsMetaData: {
                        reportsCount: 0,
                        totalCost: 0,
                        paidAmount: 0,
                        deliveryCost: 0,
                        baghdadOrdersCount: 0,
                        governoratesOrdersCount: 0,
                        clientNet: 0,
                        deliveryAgentNet: 0,
                        companyNet: 0,
                    },
                },
            });
            return;
        }
        const { page, pagesCount, reports, reportsMetaData } = await reportsService.getAllReports({
            loggedInUser: loggedInUser,
            filters: filters,
        });
        if (pagesCount === 0) {
            res.status(200).json({
                status: "success",
                page: 1,
                pagesCount: 1,
                data: {
                    reports: [],
                    reportsMetaData: {
                        reportsCount: 0,
                        totalCost: 0,
                        paidAmount: 0,
                        deliveryCost: 0,
                        baghdadOrdersCount: 0,
                        governoratesOrdersCount: 0,
                        clientNet: 0,
                        deliveryAgentNet: 0,
                        companyNet: 0,
                    },
                },
            });
            return;
        }
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: {
                reports: reports,
                reportsMetaData: reportsMetaData,
            },
        });
    });
    getReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = { reportID: +req.params.reportID };
        const report = await reportsService.getReport({
            params: params,
        });
        res.status(200).json({
            status: "success",
            data: report,
        });
    });
    getReportPDF = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = { reportID: +req.params.reportID };
        const loggedInUser = res.locals.user;
        const pdf = await reportsService.getReportPDF({
            params: params,
            loggedInUser,
        });
        // Ensure PDF data is received as a Buffer or convert it
        const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
        // Set headers for a PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
        console.log("PDF size:", pdfBuffer.length);
        res.send(pdfBuffer);
    });
    getReportsReportPDF = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const reportsData = reports_dto_1.ReportsReportPDFCreateSchema.parse(req.body);
        const filters = reports_dto_1.ReportsFiltersSchema.parse({
            page: req.query.page,
            size: req.query.size,
            company: req.query.company,
            branch: req.query.branch,
            sort: "id:asc",
            startDate: req.query.start_date,
            endDate: req.query.end_date,
            governorate: req.query.governorate,
            status: req.query.status,
            type: req.query.type,
            storeID: req.query.store_id,
            repositoryID: req.query.repository_id,
            branchID: req.query.branch_id,
            deliveryAgentID: req.query.delivery_agent_id,
            companyID: req.query.company_id,
            clientID: req.query.client_id,
            createdByID: req.query.created_by_id,
            deleted: req.query.deleted,
            minified: false,
        });
        const pdf = await reportsService.getReportsReportPDF({
            reportsData: reportsData,
            reportsFilters: filters,
        });
        const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
        // Set headers for a PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Accept-Ranges", "none"); // prevents chunking on some setups
        res.removeHeader("ETag"); // VERY IMPORTANT
        console.log("PDF size:", pdfBuffer.length);
        res.end(pdfBuffer); // fastest
    });
    updateReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const reportData = reports_dto_1.ReportUpdateSchema.parse(req.body);
        const params = { reportID: +req.params.reportID };
        const report = await reportsService.updateReport({
            params: params,
            reportData: reportData,
            loggedInUser: loggedInUser,
        });
        res.status(200).json({
            status: "success",
            data: report,
        });
    });
    deleteReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = { reportID: +req.params.reportID };
        await reportsService.deleteReport({ params });
        res.status(200).json({
            status: "success",
        });
    });
    deactivateReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = { reportID: +req.params.reportID };
        const loggedInUser = res.locals.user;
        await reportsService.deactivateReport({ params: params, loggedInUser });
        res.status(200).json({
            status: "success",
        });
    });
    reactivateReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const params = { reportID: +req.params.reportID };
        await reportsService.reactivateReport({ params: params });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.ReportController = ReportController;
//# sourceMappingURL=reports.controller.js.map