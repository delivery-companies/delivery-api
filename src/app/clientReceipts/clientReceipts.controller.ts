import { catchAsync } from "../../lib/catchAsync";
import {
  clientReceiptCreateSchema,
  clientReceiptCreateType,
} from "./clientReceipts.dto";
import { clientReceiptsRepository } from "./clientReceipts.repository";
import { AppError } from "../../lib/AppError";
import { generateReceipts } from "./helpers/generateReceipts";
import { prisma } from "../../database/db";
import { loggedInUserType } from "../../types/user";

const clientReceiptRepository = new clientReceiptsRepository();

let counter = 0;
let lastSecond = 0;
export class ClientReceiptController {
  generateOrderId(companyID: number) {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Baghdad" })
    );
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const seconds = Math.floor(now.getTime() / 1000);

    if (seconds !== lastSecond) {
      counter = 0;
      lastSecond = seconds;
    }
    counter++;

    const counterPart = String(counter).padStart(2, "0");
    const timePart = String(seconds).slice(-5);
    return `${month}${day}${timePart}${counterPart}${companyID}`;
  }

  createReceipts = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    let receipts: clientReceiptCreateType[];
    receipts = req.body.map((receipt: unknown) =>
      clientReceiptCreateSchema.parse(receipt)
    );

    const createdReceipts = [];

    for (const receipt of receipts) {
      let isUnique = false;
      let receiptId = this.generateOrderId(loggedInUser.companyID!!);
      let storeId: undefined | number;
      let branchId: undefined | number;
      while (!isUnique) {
        receiptId = this.generateOrderId(loggedInUser.companyID!!); // Assuming generateRandomId is in scope

        const exists = await prisma.clientOrderReceipt.count({
          where: {
            receiptNumber: receiptId,
          },
        });

        if (exists === 0) {
          isUnique = true;
        }
      }

      if (receipt.storeId) {
        const store = await prisma.store.findUnique({
          where: {
            id: receipt.storeId,
          },
          select: {
            client: {
              select: {
                id: true,
                branchId: true,
              },
            },
          },
        });
        if (receipt.branchId && store?.client.branchId !== receipt.branchId) {
          throw new AppError("هذا العميل لا ينتمي لهذا الفرع", 400);
        }
        storeId = receipt.storeId;
        branchId = store?.client.branchId || undefined;
      }
      if (receipt.branchId && !receipt.storeId) {
        branchId = receipt.branchId;
      }

      const createdReceipt = await clientReceiptRepository.createClientReceipt({
        storeId: receipt.storeId,
        receiptData: {
          storeId: storeId,
          branchId: branchId,
          receiptNumber: receiptId,
          notes: receipt.notes,
        },
      });

      if (!createdReceipt) {
        throw new AppError("Failed to create order", 500);
      }

      createdReceipts.push(createdReceipt);
    }
    const pdf = await generateReceipts(createdReceipts);
    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    // Set headers for a PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
    console.log("PDF size:", pdfBuffer.length);

    res.send(pdfBuffer);
  });
}
