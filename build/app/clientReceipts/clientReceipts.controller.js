"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientReceiptController = void 0;
const catchAsync_1 = require("../../lib/catchAsync");
const clientReceipts_dto_1 = require("./clientReceipts.dto");
const AppError_1 = require("../../lib/AppError");
const generateReceipts_1 = require("./helpers/generateReceipts");
const db_1 = require("../../database/db");
const clientReceipts_responses_1 = require("./clientReceipts.responses");
let counter = 0;
let lastSecond = 0;
class ClientReceiptController {
    generateOrderId() {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Baghdad" }));
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
    createReceipts = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // 1. Validate all input at once
        const receipts = req.body.map((r) => clientReceipts_dto_1.clientReceiptCreateSchema.parse(r));
        // ==== Extract storeIds & prefetch stores ====
        const storeIds = [
            ...new Set(receipts.filter((r) => r.storeId).map((r) => r.storeId)),
        ];
        let storesMap = {};
        if (storeIds.length > 0) {
            const stores = await db_1.prisma.store.findMany({
                where: { id: { in: storeIds } },
                select: {
                    id: true,
                    client: { select: { branchId: true } },
                },
            });
            storesMap = Object.fromEntries(stores.map((s) => [s.id, { branchId: s.client.branchId }]));
        }
        // ==== Generate unique receipt IDs in memory FAST ====
        const usedIds = new Set();
        const generateFastUniqueId = () => {
            let id = "";
            do {
                id = this.generateOrderId(); // must be truly random
            } while (usedIds.has(id));
            usedIds.add(id);
            return id;
        };
        // ==== Prepare database rows ====
        const rowsToInsert = [];
        const receiptsToReturn = [];
        for (const receipt of receipts) {
            let branchId = undefined;
            if (receipt.storeId) {
                const storeInfo = storesMap[receipt.storeId];
                if (!storeInfo) {
                    throw new AppError_1.AppError("Store not found", 404);
                }
                // Branch validation
                if (receipt.branchId && storeInfo.branchId !== receipt.branchId) {
                    throw new AppError_1.AppError("هذا العميل لا ينتمي لهذا الفرع", 400);
                }
                branchId = storeInfo.branchId;
            }
            if (!branchId && receipt.branchId) {
                branchId = receipt.branchId;
            }
            const receiptId = generateFastUniqueId();
            rowsToInsert.push({
                storeId: receipt.storeId || null,
                branchId: branchId,
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
        const createdReceipt = await db_1.prisma.clientOrderReceipt.createManyAndReturn({
            data: rowsToInsert,
            select: clientReceipts_responses_1.clientReceiptSelect,
        });
        // ==== Now generate PDF ====
        const pdf = await (0, generateReceipts_1.generateReceipts)(createdReceipt.map((r) => (0, clientReceipts_responses_1.receiptReform)(r)));
        const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
        res.send(pdfBuffer);
    });
}
exports.ClientReceiptController = ClientReceiptController;
//# sourceMappingURL=clientReceipts.controller.js.map