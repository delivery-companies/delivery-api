"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreUpdateOpenAPISchema = exports.StoreUpdateSchema = exports.StoreCreateOpenAPISchema = exports.StoreCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
exports.StoreCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    clientID: zod_1.z.coerce.number(),
    clientAssistantID: zod_1.z.coerce.number().optional(),
    notes: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional()
});
exports.StoreCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.StoreCreateSchema);
// export const StoreCreateMock = generateMock(StoreCreateSchema);
exports.StoreUpdateSchema = exports.StoreCreateSchema.partial();
exports.StoreUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.StoreUpdateSchema);
// export const StoreUpdateMock = generateMock(StoreUpdateSchema);
//# sourceMappingURL=stores.dto.js.map