"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeUpdateOpenAPISchema = exports.SizeUpdateSchema = exports.SizeCreateOpenAPISchema = exports.SizeCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
exports.SizeCreateSchema = zod_1.z.object({
    title: zod_1.z.string()
});
exports.SizeCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.SizeCreateSchema);
// export const SizeCreateMock = generateMock(SizeCreateSchema);
exports.SizeUpdateSchema = exports.SizeCreateSchema.partial();
exports.SizeUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.SizeUpdateSchema);
// export const SizeUpdateMock = generateMock(SizeUpdateSchema);
//# sourceMappingURL=sizes.dto.js.map