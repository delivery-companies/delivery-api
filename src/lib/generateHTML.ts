import {Governorate, OrderStatus, SecondaryReportType} from "@prisma/client";
import handlebars from "handlebars";
// @ts-expect-error
import asyncHelpers from "handlebars-async-helpers";
import {AppError} from "../lib/AppError";
import {Logger} from "../lib/logger";
import {generateBarCode} from "./generateBarCode";
import {generateQRCode} from "./generateQRCode";
import {localizeGovernorate, localizeOrderStatus} from "./localize";

const hb: typeof handlebars = asyncHelpers(handlebars);

export const generateHTML = async (template: string, data: object) => {
  try {
    hb.registerHelper("date", (date) =>
      new Date(date).toLocaleDateString("en-GB")
    );
    hb.registerHelper("mapPhones", (phones) => {
      if (!phones) return "";
      if (typeof phones === "string") return phones;
      return phones.join("\n");
    });
    hb.registerHelper("inc", (value) => Number.parseInt(value) + 1);
    hb.registerHelper(
      "add",
      (v1, v2) => (Number.parseInt(v1) || 0) + (Number.parseInt(v2) || 0)
    );
    hb.registerHelper("currency", (value) => {
      return Number(value || 0).toLocaleString("en-GB");
    });

    hb.registerHelper("colorizeRow", (status) => {
      if (
        status === OrderStatus.PARTIALLY_RETURNED ||
        status === OrderStatus.REPLACED ||
        status === OrderStatus.RETURNED
      ) {
        return "bg-red";
      }
      return "";
    });
    hb.registerHelper(
      "isBaghdad",
      (
        governorate,
        branchDeliveryCost,
        baghdadDeliveryCost,
        governoratesDeliveryCost
      ) => {
        if (
          (!baghdadDeliveryCost && !governoratesDeliveryCost) ||
          (+baghdadDeliveryCost === 0 && +governoratesDeliveryCost === 0)
        ) {
          return Number(branchDeliveryCost || 0).toLocaleString("en-GB");
        }
        if (governorate === Governorate.BAGHDAD) {
          return Number(baghdadDeliveryCost || 0).toLocaleString("en-GB");
        }
        return Number(governoratesDeliveryCost || 0).toLocaleString("en-GB");
      }
    );
    hb.registerHelper("colorizeRow2", (secondaryReportType, status) => {
      if (secondaryReportType === SecondaryReportType.RETURNED) {
        return "";
      }
      if (
        status === OrderStatus.PARTIALLY_RETURNED ||
        status === OrderStatus.REPLACED ||
        status === OrderStatus.RETURNED
      ) {
        return "bg-red";
      }
      return "";
    });

    hb.registerHelper("changed", (status, totalCost, paidAmount) => {
      if (
        (status === OrderStatus.PARTIALLY_RETURNED ||
          status === OrderStatus.DELIVERED ||
          status === OrderStatus.REPLACED) &&
        +totalCost !== +paidAmount
      ) {
        return "bg-orange";
      }

      return "";
    });

    hb.registerHelper("showNumber", (showNumber, number) => {
      if (showNumber) {
        return number;
      }

      return "لا يوجد";
    });
    hb.registerHelper("colorizeHeader", (secondaryReportType) => {
      if (secondaryReportType === SecondaryReportType.RETURNED) {
        return "bg-red";
      }
      return "bg-green";
    });
    hb.registerHelper("colorizeTitle", (secondaryReportType) => {
      if (secondaryReportType === SecondaryReportType.RETURNED) {
        return "red";
      }
      return "green";
    });
    hb.registerHelper("eq", (secondaryReportType) => {
      if (secondaryReportType === SecondaryReportType.RETURNED) {
        return false;
      }
      return true;
    });
    hb.registerHelper("check", (store) => {
      return !!store;
    });
    hb.registerHelper("QRCode", (data) => {
      return generateQRCode(
        JSON.stringify({
          id: data.receiptNumber,
        })
      );
    });
    hb.registerHelper("BarCode", (id) => {
      return generateBarCode(id.toString());
    });

    hb.registerHelper("localizeOrderStatus", (status) => {
      return localizeOrderStatus(status);
    });
    hb.registerHelper("localizeGovernorate", (governorate) => {
      return localizeGovernorate(governorate);
    });

    const compiledTemplate = hb.compile(template, {strict: true});
    const html = compiledTemplate({
      ...data,
    });

    return html;
  } catch (error) {
    Logger.error(error);
    throw new AppError("حدث خطأ أثناء انشاء ملف ال pdf", 500);
  }
};
