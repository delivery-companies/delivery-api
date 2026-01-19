"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const AppError_1 = require("./AppError");
const logger_1 = require("./logger");
const puppeteerInstance_1 = require("./puppeteerInstance");
const generatePDF = async (html, css, options = { landscape: true }) => {
    const browser = await (0, puppeteerInstance_1.getBrowser)();
    const page = await browser.newPage();
    try {
        // Use fast loading mode
        await page.setContent(`
      <style>${css ?? ""}</style>
      ${html}
    `, {
            waitUntil: "domcontentloaded", // MUCH FASTER
        });
        const pdf = await page.pdf({
            format: "A4",
            landscape: options.landscape,
            printBackground: true,
            margin: {
                top: "20px",
                right: "20px",
                bottom: "20px",
                left: "20px",
            },
        });
        return pdf;
    }
    catch (err) {
        logger_1.Logger.error(err);
        throw new AppError_1.AppError("حدث خطأ أثناء انشاء ملف ال PDF", 500);
    }
    finally {
        await page.close().catch(() => { });
    }
};
exports.generatePDF = generatePDF;
//# sourceMappingURL=generatePDF.js.map