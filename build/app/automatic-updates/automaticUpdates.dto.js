"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticUpdatesFiltersOpenAPISchema = exports.AutomaticUpdatesFiltersSchema = exports.AutomaticUpdateUpdateOpenAPISchema = exports.AutomaticUpdateUpdateSchema = exports.AutomaticUpdateCreateOpenAPISchema = exports.AutomaticUpdateCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
/* --------------------------------------------------------------- */
exports.AutomaticUpdateCreateSchema = zod_1.z.object({
    orderStatus: zod_1.z.nativeEnum(client_1.OrderStatus),
    newOrderStatus: zod_1.z.nativeEnum(client_1.OrderStatus),
    returnCondition: zod_1.z.nativeEnum(client_1.AutomaticUpdateReturnCondition).optional(),
    updateAt: zod_1.z.number().min(0).max(24),
    checkAfter: zod_1.z.number().min(0).max(480),
    enabled: zod_1.z.boolean().default(true),
    branchID: zod_1.z.number(),
    notes: zod_1.z.string().optional(),
});
exports.AutomaticUpdateCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.AutomaticUpdateCreateSchema);
// export const AutomaticUpdateCreateMock = generateMock(AutomaticUpdateCreateSchema);
/* --------------------------------------------------------------- */
exports.AutomaticUpdateUpdateSchema = exports.AutomaticUpdateCreateSchema.partial();
exports.AutomaticUpdateUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.AutomaticUpdateUpdateSchema);
// export const AutomaticUpdateUpdateMock = generateMock(AutomaticUpdateUpdateSchema);
/* --------------------------------------------------------------- */
exports.AutomaticUpdatesFiltersSchema = zod_1.z.object({
    companyID: zod_1.z.coerce.number().optional(),
    orderStatus: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    returnCondition: zod_1.z.nativeEnum(client_1.AutomaticUpdateReturnCondition).optional(),
    newOrderStatus: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    branchID: zod_1.z.coerce.number().optional(),
    enabled: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    size: zod_1.z.coerce.number().min(1).optional().default(10),
    page: zod_1.z.coerce.number().min(1).optional().default(1),
    minified: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
});
exports.AutomaticUpdatesFiltersOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.AutomaticUpdatesFiltersSchema);
// export const AutomaticUpdatesFiltersMock = generateMock(AutomaticUpdatesFiltersSchema);
/* --------------------------------------------------------------- */
//# sourceMappingURL=automaticUpdates.dto.js.map