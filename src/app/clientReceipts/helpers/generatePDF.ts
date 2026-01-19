import {Logger} from "../../../lib/logger";
import {AppError} from "../../../lib/AppError";
// import puppeteer from "puppeteer";
import {getBrowser} from "../../../lib/puppeteerInstance";

// html and css content or html and css file path

export const generatePDF = async (
  html: string,
  css?: string,
  options: {
    landscape?: boolean;
  } = {
    landscape: true,
  }
) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.emulateMediaType("print");
    await page.setContent(html);
    css && (await page.addStyleTag({content: css}));

    const pdf = await page.pdf({
      width: "100mm",
      height: "100mm",
      landscape: options.landscape,
      printBackground: true,
      margin: {top: "10px", right: "10px", bottom: "10px", left: "10px"},
    });

    return pdf;
    // return Buffer.from(Object.values(pdf));
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  } finally {
    await page.close().catch(() => {});
  }
};
