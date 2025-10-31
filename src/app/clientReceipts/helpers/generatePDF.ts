import puppeteer from "puppeteer";
import {Logger} from "../../../lib/logger";
import {AppError} from "../../../lib/AppError";

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
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--disable-extensions"],
    });
    const page = await browser.newPage();

    await page.emulateMediaType("print");
    await page.setContent(html);
    css && (await page.addStyleTag({content: css}));

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

    await browser.close();
    return pdf;
    // return Buffer.from(Object.values(pdf));
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  }
};
