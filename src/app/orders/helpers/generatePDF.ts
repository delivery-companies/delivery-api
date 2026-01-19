import {Logger} from "../../../lib/logger";
import {AppError} from "../../../lib/AppError";
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
    await page.setContent(
      `
      <style>${css ?? ""}</style>
      ${html}
    `,
      {
        waitUntil: "domcontentloaded", // MUCH FASTER
      }
    );

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
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  } finally {
    await page.close().catch(() => {});
  }
};
