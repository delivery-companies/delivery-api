import fs from "node:fs/promises";
import path from "node:path";
import type { ReportType } from "@prisma/client";
import { AppError } from "../../../lib/AppError";
import { generateHTML } from "../../../lib/generateHTML";
import { generatePDF } from "../../../lib/generatePDF";
import { Logger } from "../../../lib/logger";
import type { reportReform } from "../reports.responses";

export const generateReportsReport = async (
    reportType: ReportType,
    reportsData: object,
    reports: ReturnType<typeof reportReform>[]
) => {
    try {
        let templatePath = "";
        if (reportType === "CLIENT") {
            templatePath = path.join(__dirname, "../../../../static/templates/clientReportsReport.hbs");
        } else {
            throw new Error("لا يوجد قالب لهذا التقرير");
        }

        const template = await fs.readFile(templatePath, "utf8");
        const css = await fs.readFile(
            path.join(__dirname, "../../../../static/styles/reportStyle.css"),
            "utf8"
        );

        const html = await generateHTML(template, {
            reports,
            reportsData
        });
        const pdf = await generatePDF(html, css);

        return pdf;
    } catch (error) {
        Logger.error(error);
        throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
    }
};
