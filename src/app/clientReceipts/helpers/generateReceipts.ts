import fs from "node:fs/promises";
import path from "node:path";
import {AppError} from "../../..//lib/AppError";
import {generateHTML} from "../../..//lib/generateHTML";
import {generatePDF} from "./generatePDF";
import {Logger} from "../../../lib/logger";
import {receiptReform} from "../clientReceipts.responses";

export const generateReceipts = async (
  receipts: ReturnType<typeof receiptReform>[]
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../../../static/templates/clientReceipt.hbs"
    );

    // const css = await fs.readFile(
    //   path.join(__dirname, "../../../../static/styles/receiptStyle.css"),
    //   "utf8"
    // );
    const template = await fs.readFile(templatePath, "utf8");

    const html = await generateHTML(template, {receipts});

    const pdf = await generatePDF(html, "", {landscape: false});

    return pdf;
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  }
};
