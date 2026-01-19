import fs from "node:fs/promises";
import path from "node:path";
import type {ReportType} from "@prisma/client";
import {AppError} from "../../..//lib/AppError";
import {generateHTML} from "../../..//lib/generateHTML";
import {generatePDF} from "../../..//lib/generatePDF";
import type {orderReform} from "../../../app/orders/orders.responses";
import {Logger} from "../../../lib/logger";
import type {reportReform} from "../reports.responses";
import {uploadPdfToSpaces} from "../../../lib/uploadPdfToSpaces";
import {prisma} from "../../../database/db";

export const generateReport = async (
  reportType: ReportType,
  reportData: ReturnType<typeof reportReform>,
  orders: ReturnType<typeof orderReform>[]
) => {
  const STATIC_DIR =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "build/static")
      : path.join(process.cwd(), "src/static");

  try {
    let templatePath = "";
    if (reportType === "CLIENT") {
      templatePath = path.join(STATIC_DIR, "templates/clientReport.hbs");
    } else if (reportType === "BRANCH") {
      templatePath = path.join(STATIC_DIR, "templates/branchReport.hbs");
    } else if (reportType === "COMPANY") {
      templatePath = path.join(STATIC_DIR, "templates/companyReport.hbs");
    } else if (reportType === "DELIVERY_AGENT") {
      templatePath = path.join(STATIC_DIR, "templates/deliveryAgentReport.hbs");
    } else if (reportType === "GOVERNORATE") {
      templatePath = path.join(STATIC_DIR, "templates/governorateReport.hbs");
    } else if (reportType === "REPOSITORY") {
      templatePath = path.join(STATIC_DIR, "templates/repositoryReport.hbs");
    } else {
      throw new Error("لا يوجد قالب لهذا التقرير");
    }

    const template = await fs.readFile(templatePath, "utf8");
    const css = await fs.readFile(
      path.join(STATIC_DIR, "styles/reportStyle.css"),
      "utf8"
    );

    const html = await generateHTML(template, {reportData, orders});

    const pdf = await generatePDF(html, css);

    const pdfUrl = await uploadPdfToSpaces(pdf, reportData?.id!!);

    await prisma.report.update({
      where: {id: reportData?.id},
      data: {
        url: pdfUrl,
      },
    });

    return pdf;
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  }
};
