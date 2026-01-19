"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceipts = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const AppError_1 = require("../../..//lib/AppError");
const generateHTML_1 = require("../../..//lib/generateHTML");
const generatePDF_1 = require("./generatePDF");
const logger_1 = require("../../../lib/logger");
const generateReceipts = async (receipts) => {
    try {
        const templatePath = node_path_1.default.join(__dirname, "../../../static/templates/clientReceipt.hbs");
        // const css = await fs.readFile(
        //   path.join(__dirname, "../../../../static/styles/receiptStyle.css"),
        //   "utf8"
        // );
        const template = await promises_1.default.readFile(templatePath, "utf8");
        const html = await (0, generateHTML_1.generateHTML)(template, { receipts });
        const pdf = await (0, generatePDF_1.generatePDF)(html, "", { landscape: false });
        return pdf;
    }
    catch (error) {
        logger_1.Logger.error(error);
        throw new AppError_1.AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
    }
};
exports.generateReceipts = generateReceipts;
//# sourceMappingURL=generateReceipts.js.map