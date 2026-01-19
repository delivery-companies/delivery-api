"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHTML = void 0;
const client_1 = require("@prisma/client");
const handlebars_1 = __importDefault(require("handlebars"));
// @ts-expect-error
const handlebars_async_helpers_1 = __importDefault(require("handlebars-async-helpers"));
const AppError_1 = require("../lib/AppError");
const logger_1 = require("../lib/logger");
const generateBarCode_1 = require("./generateBarCode");
const generateQRCode_1 = require("./generateQRCode");
const localize_1 = require("./localize");
const hb = (0, handlebars_async_helpers_1.default)(handlebars_1.default);
const generateHTML = async (template, data) => {
    try {
        hb.registerHelper("date", (date) => new Date(date).toLocaleDateString("en-GB"));
        hb.registerHelper("mapPhones", (phones) => {
            if (!phones)
                return "";
            if (typeof phones === "string")
                return phones;
            return phones.join("\n");
        });
        hb.registerHelper("inc", (value) => Number.parseInt(value) + 1);
        hb.registerHelper("add", (v1, v2) => (Number.parseInt(v1) || 0) + (Number.parseInt(v2) || 0));
        hb.registerHelper("currency", (value) => {
            return Number(value || 0).toLocaleString("en-GB");
        });
        hb.registerHelper("colorizeRow", (status) => {
            if (status === client_1.OrderStatus.PARTIALLY_RETURNED ||
                status === client_1.OrderStatus.REPLACED ||
                status === client_1.OrderStatus.RETURNED) {
                return "bg-red";
            }
            return "";
        });
        hb.registerHelper("isBaghdad", (governorate, branchDeliveryCost, baghdadDeliveryCost, governoratesDeliveryCost) => {
            if ((!baghdadDeliveryCost && !governoratesDeliveryCost) ||
                (+baghdadDeliveryCost === 0 && +governoratesDeliveryCost === 0)) {
                return Number(branchDeliveryCost || 0).toLocaleString("en-GB");
            }
            if (governorate === client_1.Governorate.BAGHDAD) {
                return Number(baghdadDeliveryCost || 0).toLocaleString("en-GB");
            }
            return Number(governoratesDeliveryCost || 0).toLocaleString("en-GB");
        });
        hb.registerHelper("colorizeRow2", (secondaryReportType, status) => {
            if (secondaryReportType === client_1.SecondaryReportType.RETURNED) {
                return "";
            }
            if (status === client_1.OrderStatus.PARTIALLY_RETURNED ||
                status === client_1.OrderStatus.REPLACED ||
                status === client_1.OrderStatus.RETURNED) {
                return "bg-red";
            }
            return "";
        });
        hb.registerHelper("changed", (status, totalCost, paidAmount) => {
            if ((status === client_1.OrderStatus.PARTIALLY_RETURNED ||
                status === client_1.OrderStatus.DELIVERED ||
                status === client_1.OrderStatus.REPLACED) &&
                +totalCost !== +paidAmount) {
                return "bg-orange";
            }
            return "";
        });
        hb.registerHelper("showNumber", (showNumber, number) => {
            if (showNumber) {
                return number;
            }
            return "لا يوجد";
        });
        hb.registerHelper("colorizeHeader", (secondaryReportType) => {
            if (secondaryReportType === client_1.SecondaryReportType.RETURNED) {
                return "bg-red";
            }
            return "bg-green";
        });
        hb.registerHelper("colorizeTitle", (secondaryReportType) => {
            if (secondaryReportType === client_1.SecondaryReportType.RETURNED) {
                return "red";
            }
            return "green";
        });
        hb.registerHelper("eq", (secondaryReportType) => {
            if (secondaryReportType === client_1.SecondaryReportType.RETURNED) {
                return false;
            }
            return true;
        });
        hb.registerHelper("check", (store) => {
            return !!store;
        });
        hb.registerHelper("QRCode", (data) => {
            return (0, generateQRCode_1.generateQRCode)(JSON.stringify({
                id: data.receiptNumber,
            }));
        });
        hb.registerHelper("BarCode", (id) => {
            return (0, generateBarCode_1.generateBarCode)(id.toString());
        });
        hb.registerHelper("localizeOrderStatus", (status) => {
            return (0, localize_1.localizeOrderStatus)(status);
        });
        hb.registerHelper("localizeGovernorate", (governorate) => {
            return (0, localize_1.localizeGovernorate)(governorate);
        });
        const compiledTemplate = hb.compile(template, { strict: true });
        const html = compiledTemplate({
            ...data,
        });
        return html;
    }
    catch (error) {
        logger_1.Logger.error(error);
        throw new AppError_1.AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
    }
};
exports.generateHTML = generateHTML;
//# sourceMappingURL=generateHTML.js.map