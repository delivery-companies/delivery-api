import {AppError} from "./AppError";
import {Logger} from "./logger";
import {getBrowser} from "./puppeteerInstance";

export const generatePDF = async (
  html: string,
  css?: string,
  options = {landscape: true}
) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // Use fast loading mode
    await page.setContent(
      `
      <style>${css ?? ""}</style>
      ${html}
    `,
      {
        waitUntil: "domcontentloaded", // MUCH FASTER
      }
    );

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
  } catch (err) {
    Logger.error(err);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال PDF", 500);
  } finally {
    await page.close().catch(() => {});
  }
};
