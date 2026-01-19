"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const AppError_1 = require("../../..//lib/AppError");
const generateHTML_1 = require("../../..//lib/generateHTML");
const generatePDF_1 = require("../../..//lib/generatePDF");
const logger_1 = require("../../../lib/logger");
const uploadPdfToSpaces_1 = require("../../../lib/uploadPdfToSpaces");
const db_1 = require("../../../database/db");
const generateReport = async (reportType, reportData, orders) => {
    const STATIC_DIR = process.env.NODE_ENV === "production"
        ? node_path_1.default.join(process.cwd(), "build/static")
        : node_path_1.default.join(process.cwd(), "src/static");
    try {
        let templatePath = "";
        if (reportType === "CLIENT") {
            templatePath = node_path_1.default.join(STATIC_DIR, "templates/clientReport.hbs");
        }
        else if (reportType === "BRANCH") {
            templatePath = node_path_1.default.join(STATIC_DIR, "templates/branchReport.hbs");
        }
        else if (reportType === "COMPANY") {
            templatePath = node_path_1.default.join(STATIC_DIR, "templates/companyReport.hbs");
        }
        else if (reportType === "DELIVERY_AGENT") {
            templatePath = node_path_1.default.join(STATIC_DIR, "templates/deliveryAgentReport.hbs");
        }
        else if (reportType === "GOVERNORATE") {
            templatePath = node_path_1.default.join(STATIC_DIR, "templates/governorateReport.hbs");
        }
        else if (reportType === "REPOSITORY") {
            templatePath = node_path_1.default.join(STATIC_DIR, "templates/repositoryReport.hbs");
        }
        else {
            throw new Error("لا يوجد قالب لهذا التقرير");
        }
        const template = await promises_1.default.readFile(templatePath, "utf8");
        const css = await promises_1.default.readFile(node_path_1.default.join(STATIC_DIR, "styles/reportStyle.css"), "utf8");
        const html = await (0, generateHTML_1.generateHTML)(template, { reportData, orders });
        const pdf = await (0, generatePDF_1.generatePDF)(html, css);
        const pdfUrl = await (0, uploadPdfToSpaces_1.uploadPdfToSpaces)(pdf, reportData?.id);
        await db_1.prisma.report.update({
            where: { id: reportData?.id },
            data: {
                url: pdfUrl,
            },
        });
        return pdf;
    }
    catch (error) {
        logger_1.Logger.error(error);
        throw new AppError_1.AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
    }
};
exports.generateReport = generateReport;
//# sourceMappingURL=generateReport.js.map