// // import { Order } from "@prisma/client";
// // import fs from "fs";
// import { Governorate, ReportType } from "@prisma/client";
// import { createCanvas, loadImage } from "canvas";
// import PdfPrinter from "pdfmake";
// import { TDocumentDefinitions } from "pdfmake/interfaces";
// import { AppError } from "../../../lib/AppError";
// import { handleArabicCharacters } from "../../../lib/handleArabicCharacters";
// import { localizeGovernorate, localizeOrderStatus, localizeReportType } from "../../../lib/localize";
// import { Logger } from "../../../lib/logger";
// import { orderReform } from "../../orders/orders.dto";
// import { reportReform } from "../reports.dto";

// const getImage = async (url: string | Buffer) => {
//     try {
//         const image = await loadImage(url);
//         const canvas = createCanvas(image.width, image.height);
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(image, 0, 0);
//         return canvas.toDataURL();
//     } catch (error) {
//         Logger.error(error);
//         return "";
//     }
// };

// export const generateReport = async (
//     reportType: ReportType,
//     reportData: ReturnType<typeof reportReform>,
//     orders: ReturnType<typeof orderReform>[]
// ) => {
//     if (!reportData) {
//         throw new AppError("لا يوجد بيانات لعمل الكشف", 404);
//     }
//     if (!orders) {
//         throw new AppError("لا يوجد طلبات لعمل الكشف", 404);
//     }
//     try {
//         let counter = 0;

//         const fonts = {
//             Cairo: {
//                 normal: "static/fonts/Cairo-VariableFont_slntwght.ttf",
//                 bold: "static/fonts/Cairo-VariableFont_slntwght.ttf",
//                 italics: "static/fonts/Cairo-VariableFont_slntwght.ttf",
//                 bolditalics: "static/fonts/Cairo-VariableFont_slntwght.ttf"
//             },
//             Amiri: {
//                 normal: "static/fonts/Amiri-Regular.ttf",
//                 bold: "static/fonts/Amiri-Bold.ttf",
//                 italics: "static/fonts/Amiri-Italic.ttf",
//                 bolditalics: "static/fonts/Amiri-BoldItalic.ttf"
//             }
//         };

//         const printer = new PdfPrinter(fonts);

//         const imageData = await getImage(orders[0]?.company?.logo || "");

//         // Generate the docDefinition dynamically based on the provided order data
//         const docDefinition: TDocumentDefinitions = {
//             pageSize: "A4" as const,
//             pageOrientation: "landscape" as const,
//             pageMargins: [5, 15, 5, 15] as [number, number, number, number],
//             watermark: {
//                 text: handleArabicCharacters("شركة البرق"),
//                 color: "red",
//                 opacity: 0.03,
//                 bold: true,
//                 italics: false
//             },
//             defaultStyle: {
//                 font: "Amiri",
//                 alignment: "center" as const,
//                 fontSize: 10,
//                 bold: true
//                 // direction: "rtl" // Right-to-left text direction for Arabic
//             },
//             styles: {
//                 header: {
//                     fontSize: 18,
//                     bold: true,
//                     margin: 10
//                     // alignment: "right" as const
//                 },
//                 headerTable: {
//                     fontSize: 12
//                 },
//                 red: {
//                     color: "red"
//                 }
//             },
//             // direction: "rtl" // Right-to-left text direction for Arabic
//             content: [
//                 // {
//                 //     image: "static/assets/albarq-logo.png",
//                 //     width: 80
//                 // },
//                 // { text: "\n" },
//                 // table of report info without border
//                 {
//                     layout: "noBorders",
//                     style: "headerTable",
//                     table: {
//                         widths: ["*", "*", "*", "*"],
//                         body: [
//                             [
//                                 {
//                                     rowSpan: 3,
//                                     image:
//                                         imageData === ""
//                                             ? "static/assets/placeholder-logo.png"
//                                             : `data:image/jpeg,${imageData}`,
//                                     width: 80
//                                 },
//                                 {
//                                     text: handleArabicCharacters(
//                                         `عدد الطلبيات: ${
//                                             (reportData.baghdadOrdersCount || 0) +
//                                             (reportData.governoratesOrdersCount || 0)
//                                         }`
//                                     ),
//                                     noWrap: true
//                                 },
//                                 {
//                                     text: handleArabicCharacters(`كشف ${localizeReportType(reportType)}`),
//                                     noWrap: true
//                                 },
//                                 {
//                                     text: handleArabicCharacters(`رقم الكشف: ${reportData.id}`)
//                                 }
//                             ],
//                             [
//                                 "",
//                                 {
//                                     text: handleArabicCharacters(
//                                         `عدد طلبيات بغداد: ${reportData.baghdadOrdersCount}`
//                                     ),
//                                     noWrap: true
//                                 },
//                                 {
//                                     text: handleArabicCharacters(
//                                         reportType === "CLIENT"
//                                             ? reportData.clientReport?.client.name ?? ""
//                                             : reportType === "REPOSITORY"
//                                               ? reportData.repositoryReport?.repository.name ?? ""
//                                               : reportType === "BRANCH"
//                                                   ? reportData.branchReport?.branch.name ?? ""
//                                                   : reportType === "GOVERNORATE" &&
//                                                           reportData.governorateReport
//                                                       ? localizeGovernorate(
//                                                               reportData.governorateReport.governorate
//                                                           )
//                                                       : reportType === "DELIVERY_AGENT"
//                                                           ? reportData.deliveryAgentReport?.deliveryAgent
//                                                                   .name ?? ""
//                                                           : reportType === "COMPANY"
//                                                               ? reportData.companyReport?.company.name ?? ""
//                                                               : ""
//                                     ),
//                                     noWrap: true
//                                 },
//                                 {
//                                     text: handleArabicCharacters(
//                                         `التاريخ: ${reportData.createdAt.toLocaleDateString()}`
//                                     )
//                                 }
//                             ],
//                             [
//                                 "",
//                                 {
//                                     text: handleArabicCharacters(
//                                         `عدد طلبيات المحافظات: ${reportData.governoratesOrdersCount}`
//                                     ),
//                                     noWrap: true
//                                 },
//                                 {
//                                     // TODO
//                                     text: reportData.clientReport?.store
//                                         ? handleArabicCharacters(
//                                               `الصفحة: ${reportData.clientReport.store.name}`
//                                           )
//                                         : ""
//                                 },
//                                 {
//                                     text:
//                                         reportType === "CLIENT"
//                                             ? handleArabicCharacters(`صافي العميل: ${reportData.clientNet}`)
//                                             : reportType === "BRANCH" ||
//                                                   reportType === "GOVERNORATE" ||
//                                                   reportType === "DELIVERY_AGENT"
//                                               ? handleArabicCharacters(
//                                                       `صافي الشركة: ${reportData.companyNet}`
//                                                   )
//                                               : "",
//                                     noWrap: true
//                                 }
//                             ]
//                         ]
//                     }
//                 },
//                 { text: "\n" },
//                 // table of orders
//                 {
//                     table: {
//                         headerRows: 1,
//                         // widths: [, , , , , , , , , ],
//                         // wedths depends on header row length that are fixed
//                         widths: [
//                             "auto",
//                             "auto",
//                             "auto",
//                             "auto",
//                             "auto",
//                             "auto",
//                             "auto",
//                             "*",
//                             "auto",
//                             "auto",
//                             "auto",
//                             "auto"
//                         ],
//                         body: [
//                             [
//                                 {
//                                     text: handleArabicCharacters("الملاحظات"),
//                                     noWrap: true
//                                     // fillColor: "#5bc0de"
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("الحالة"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 reportType === "BRANCH" ||
//                                 reportType === "GOVERNORATE" ||
//                                 reportType === "DELIVERY_AGENT"
//                                     ? {
//                                           text: handleArabicCharacters("صافي المندوب"),
//                                           noWrap: true
//                                           // style: "header"
//                                       }
//                                     : "",
//                                 reportType === "CLIENT" || reportType === "REPOSITORY"
//                                     ? {
//                                           text: handleArabicCharacters("صافي العميل"),
//                                           noWrap: true
//                                           // style: "header"
//                                       }
//                                     : "",
//                                 reportType === "CLIENT" || reportType === "REPOSITORY"
//                                     ? {
//                                           text: handleArabicCharacters("مبلغ التوصيل"),
//                                           noWrap: true
//                                           // style: "header"
//                                       }
//                                     : "",
//                                 {
//                                     text: handleArabicCharacters("المبلغ المستلم"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("مبلغ الوصل"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("عنوان المستلم"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("هاتف المستلم"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("انشئ في"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("رقم الوصل"),
//                                     noWrap: true
//                                     // style: "header"
//                                 },
//                                 {
//                                     text: handleArabicCharacters("#"),
//                                     noWrap: true
//                                     // style: "header"
//                                 }
//                             ],
//                             ...orders.map((order) => {
//                                 if (!order) {
//                                     throw new AppError("لا يوجد طلبات لعمل الكشف", 404);
//                                 }
//                                 return [
//                                     {
//                                         // text: handleArabicCharacters(
//                                         //     "مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد مسجد جامعة بغداد"
//                                         // ),
//                                         text: handleArabicCharacters(order.notes || "")
//                                         // style: "red",
//                                         // fillColor: "#5bc0de"
//                                     },
//                                     {
//                                         text: handleArabicCharacters(
//                                             localizeOrderStatus(order.status) || "اخري"
//                                         )
//                                     },
//                                     reportType === "BRANCH" ||
//                                     reportType === "GOVERNORATE" ||
//                                     reportType === "DELIVERY_AGENT"
//                                         ? {
//                                               text: order.deliveryAgent
//                                                   ? order.deliveryAgent.deliveryCost?.toString() || "0"
//                                                   : "0"
//                                           }
//                                         : {},
//                                     reportType === "CLIENT" || reportType === "REPOSITORY"
//                                         ? {
//                                               text: order.clientNet?.toString() || "0"
//                                               // fillColor: "#5bc0de"
//                                           }
//                                         : {},
//                                     reportType === "CLIENT" || reportType === "REPOSITORY"
//                                         ? {
//                                               text: order.deliveryCost?.toString() || "0"
//                                           }
//                                         : {},
//                                     {
//                                         text: order.paidAmount?.toString() || "0"
//                                     },
//                                     {
//                                         text: order.totalCost.toString()
//                                     },
//                                     {
//                                         text: `${handleArabicCharacters(
//                                             localizeGovernorate(order.governorate as Governorate) || ""
//                                         )}  -  ${handleArabicCharacters(
//                                             // "مسجد جامعة بغداد - مسجد جامعة بغداد - مسجد جامعة بغداد - مسجد جامعة بغداد - مسجد جامعة بغداد - مسجد جامعة بغداد"
//                                             order.recipientAddress || ""
//                                         )}`
//                                     },
//                                     {
//                                         text: order.recipientPhones.map((phone, i) => {
//                                             return i === order.recipientPhones.length - 1
//                                                 ? phone
//                                                 : `${phone} - `;
//                                         })
//                                     },
//                                     {
//                                         text: order.createdAt.toLocaleDateString()
//                                     },
//                                     {
//                                         text: order.receiptNumber.toString()
//                                     },
//                                     {
//                                         text: ++counter
//                                     }
//                                 ];
//                             })
//                         ]
//                     }
//                 }
//             ]
//         };

//         const options = {};

//         const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

//         // if (!fs.existsSync("storage/receipts")) {
//         //     fs.mkdirSync("storage/receipts", { recursive: true });
//         // }

//         // pdfDoc.pipe(
//         //     fs.createWriteStream(
//         //         `storage/receipts/receipt-${order.receiptNumber.toString()}.pdf`
//         //     )
//         // );
//         // pdfDoc.end();

//         return pdfDoc;
//     } catch (error) {
//         Logger.error(error);
//         throw new AppError("حدث خطأ اثناء انشاء ملف ال pdf", 500);
//     }
// };
