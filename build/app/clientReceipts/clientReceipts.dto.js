"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientReceiptCreateSchema = void 0;
const zod_1 = require("zod");
exports.clientReceiptCreateSchema = zod_1.z.object({
    // receiptNumber:z.number(),
    storeId: zod_1.z.coerce.number().optional(),
    branchId: zod_1.z.coerce.number().optional(),
    receiptNumber: zod_1.z.coerce.string(),
    notes: zod_1.z.coerce.string(),
});
//# sourceMappingURL=clientReceipts.dto.js.map