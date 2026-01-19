"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const logger_1 = require("../../../lib/logger");
const AppError_1 = require("../../../lib/AppError");
const puppeteerInstance_1 = require("../../../lib/puppeteerInstance");
// html and css content or html and css file path
const generatePDF = async (html, css, options = {
    landscape: true,
}) => {
    const browser = await (0, puppeteerInstance_1.getBrowser)();
    const page = await browser.newPage();
    try {
        await page.emulateMediaType("print");
        await page.setContent(`
      <style>${css ?? ""}</style>
      ${html}
    `, {
            waitUntil: "domcontentloaded", // MUCH FASTER
        });
        const isLandscape = options.landscape === true;
        const pdf = await page.pdf({
            width: isLandscape ? "210mm" : "148mm",
            height: isLandscape ? "148mm" : "210mm",
            landscape: isLandscape,
            printBackground: true,
            margin: {
                top: "5mm",
                right: "5mm",
                bottom: "5mm",
                left: "5mm",
            },
        });
        return pdf;
        // return Buffer.from(Object.values(pdf));
    }
    catch (error) {
        logger_1.Logger.error(error);
        throw new AppError_1.AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
    }
    finally {
        await page.close().catch(() => { });
    }
};
exports.generatePDF = generatePDF;
//# sourceMappingURL=generatePDF.js.map