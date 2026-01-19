import fs from "node:fs/promises";
import path from "node:path";
import {AppError} from "../../../lib/AppError";
import {generateHTML} from "../../../lib/generateHTML";
import {generatePDF} from "../../../lib/generatePDF";
import {Logger} from "../../../lib/logger";
import type {orderReform} from "../orders.responses";

export const generateOrdersReport = async (
  type: "DELIVERY_AGENT_MANIFEST" | "GENERAL",
  ordersData: object,
  orders: ReturnType<typeof orderReform>[]
) => {
  try {
    let templatePath = "";
    if (type === "DELIVERY_AGENT_MANIFEST") {
      templatePath = path.join(
        __dirname,
        "../../../static/templates/deliveryAgentManifest.hbs"
      );
    } else if (type === "GENERAL") {
      templatePath = path.join(
        __dirname,
        "../../../static/templates/ordersReport.hbs"
      );
    } else {
      throw new Error("لا يوجد قالب لهذا التقرير");
    }

    const template = await fs.readFile(templatePath, "utf8");
    const css = await fs.readFile(
      path.join(__dirname, "../../../static/styles/reportStyle.css"),
      "utf8"
    );

    const html = await generateHTML(template, {
      orders,
      ordersData,
    });
    const pdf = await generatePDF(html, css);

    return pdf;
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  }
};
