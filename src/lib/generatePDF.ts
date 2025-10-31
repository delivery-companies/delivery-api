import puppeteer from "puppeteer";
import { AppError } from "./AppError";
import { Logger } from "./logger";

// html and css content or html and css file path

export const generatePDF = async (
    html: string,
    css?: string,
    options: {
        landscape?: boolean;
    } = {
        landscape: true
    }
) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            ignoreDefaultArgs: ["--disable-extensions"],
        });
        const page = await browser.newPage();
 
        await page.emulateMediaType("print");
        await page.setContent(html);
        css && (await page.addStyleTag({ content: css }));

        const pdf = await page.pdf({
            format: "A4",
            landscape: options.landscape,
            printBackground: true,
            margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
        });

        await browser.close();
        return pdf;
        // return Buffer.from(Object.values(pdf));
    } catch (error) {
        Logger.error(error);
        throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
    }
};
