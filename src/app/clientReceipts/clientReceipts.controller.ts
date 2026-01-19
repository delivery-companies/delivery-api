import {catchAsync} from "../../lib/catchAsync";
import {
  clientReceiptCreateSchema,
  clientReceiptCreateType,
} from "./clientReceipts.dto";
import {AppError} from "../../lib/AppError";
import {generateReceipts} from "./helpers/generateReceipts";
import {prisma} from "../../database/db";
import {Prisma} from "@prisma/client";
import {clientReceiptSelect, receiptReform} from "./clientReceipts.responses";

let counter = 0;
let lastSecond = 0;
export class ClientReceiptController {
  generateOrderId() {
    const now = new Date(
      new Date().toLocaleString("en-US", {timeZone: "Asia/Baghdad"})
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
    return `${month}${day}${timePart}${counterPart}`;
  }

  createReceipts = catchAsync(async (req, res) => {
    // 1. Validate all input at once
    const receipts: clientReceiptCreateType[] = req.body.map((r: unknown) =>
      clientReceiptCreateSchema.parse(r)
    );

    // ==== Extract storeIds & prefetch stores ====
    const storeIds = [
      ...new Set(receipts.filter((r) => r.storeId).map((r) => r.storeId!)),
    ];

    let storesMap: Record<number, {branchId: number}> = {};

    if (storeIds.length > 0) {
      const stores = await prisma.store.findMany({
        where: {id: {in: storeIds}},
        select: {
          id: true,
          client: {select: {branchId: true}},
        },
      });

      storesMap = Object.fromEntries(
        stores.map((s) => [s.id, {branchId: s.client.branchId!!}])
      );
    }

    // ==== Generate unique receipt IDs in memory FAST ====
    const usedIds = new Set<string>();

    const generateFastUniqueId = () => {
      let id = "";
      do {
        id = this.generateOrderId(); // must be truly random
      } while (usedIds.has(id));
      usedIds.add(id);
      return id;
    };

    // ==== Prepare database rows ====
    const rowsToInsert: Prisma.ClientOrderReceiptCreateManyInput[] = [];

    const receiptsToReturn = [];

    for (const receipt of receipts) {
      let branchId: number | undefined = undefined;

      if (receipt.storeId) {
        const storeInfo = storesMap[receipt.storeId];
        if (!storeInfo) {
          throw new AppError("Store not found", 404);
        }

        // Branch validation
        if (receipt.branchId && storeInfo.branchId !== receipt.branchId) {
          throw new AppError("هذا العميل لا ينتمي لهذا الفرع", 400);
        }

        branchId = storeInfo.branchId;
      }

      if (!branchId && receipt.branchId) {
        branchId = receipt.branchId;
      }

      const receiptId = generateFastUniqueId();

      rowsToInsert.push({
        storeId: receipt.storeId || null,
        branchId: branchId!!,
        receiptNumber: receiptId,
        notes: receipt.notes || null,
      });

      receiptsToReturn.push({
        storeId: receipt.storeId,
        branchId,
        receiptNumber: receiptId,
        notes: receipt.notes,
      });
    }

    // ==== Insert ALL receipts at once (super fast) ====
    const createdReceipt = await prisma.clientOrderReceipt.createManyAndReturn({
      data: rowsToInsert,
      select: clientReceiptSelect,
    });

    // ==== Now generate PDF ====
    const pdf = await generateReceipts(
      createdReceipt.map((r) => receiptReform(r))
    );
    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
    res.send(pdfBuffer);
  });
}
