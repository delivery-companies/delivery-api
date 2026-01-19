"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientReceiptsRepository = void 0;
const db_1 = require("../../database/db");
// import { AppError } from "../../lib/AppError";
const clientReceipts_responses_1 = require("./clientReceipts.responses");
class clientReceiptsRepository {
    async createClientReceipt(data) {
        const store = await db_1.prisma.store.findUnique({
            where: {
                id: data.storeId,
            },
            select: {
                id: true,
            },
        });
        const receiptData = {
            receiptNumber: data.receiptData.receiptNumber,
        };
        if (store?.id) {
            receiptData.store = { connect: { id: store.id } };
        }
        if (data.receiptData.branchId) {
            receiptData.branch = { connect: { id: data.receiptData.branchId } };
        }
        const createdReceipt = await db_1.prisma.clientOrderReceipt.create({
            data: { ...receiptData, notes: data.receiptData.notes },
            select: clientReceipts_responses_1.clientReceiptSelect,
        });
        return (0, clientReceipts_responses_1.receiptReform)(createdReceipt);
    }
}
exports.clientReceiptsRepository = clientReceiptsRepository;
//# sourceMappingURL=clientReceipts.repository.js.map