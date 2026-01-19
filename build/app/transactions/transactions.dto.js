"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionUpdateSchema = exports.TransactionCreateSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.TransactionCreateSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.TransactionType),
    for: zod_1.z.string(),
    paidAmount: zod_1.z.coerce.number().optional(),
    employeeId: zod_1.z.coerce.number().optional(),
    createdById: zod_1.z.coerce.number().optional(),
});
exports.TransactionUpdateSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.TransactionType).optional(),
    for: zod_1.z.string().optional(),
    employeeId: zod_1.z.number().optional(),
});
//# sourceMappingURL=transactions.dto.js.map