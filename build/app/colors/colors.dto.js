"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorUpdateOpenAPISchema = exports.ColorUpdateSchema = exports.ColorCreateOpenAPISchema = exports.ColorCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
exports.ColorCreateSchema = zod_1.z.object({
    title: zod_1.z.string(),
    code: zod_1.z.string(),
});
exports.ColorCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ColorCreateSchema);
// export const ColorCreateMock = generateMock(ColorCreateSchema);
exports.ColorUpdateSchema = exports.ColorCreateSchema.partial();
exports.ColorUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ColorUpdateSchema);
// export const ColorUpdateMock = generateMock(ColorUpdateSchema);
//# sourceMappingURL=colors.dto.js.map