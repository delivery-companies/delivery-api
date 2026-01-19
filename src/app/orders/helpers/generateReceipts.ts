import fs from "node:fs/promises";
import path from "node:path";
import {AppError} from "../../..//lib/AppError";
import {generateHTML} from "../../..//lib/generateHTML";
import type {orderReform} from "../../../app/orders/orders.responses";
import {Logger} from "../../../lib/logger";
import {generatePDF} from "./generatePDF";

export const generateReceipts = async (
  orders: ReturnType<typeof orderReform>[]
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../../../static/templates/receipt2.hbs"
    );

    const template = await fs.readFile(templatePath, "utf8");
    const css = await fs.readFile(
      path.join(__dirname, "../../../static/styles/receiptStyle.css"),
      "utf8"
    );

    const html = await generateHTML(template, {orders});
    const pdf = await generatePDF(html, css, {landscape: false});

    return pdf;
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  }
};
