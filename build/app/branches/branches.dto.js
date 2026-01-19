"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchUpdateOpenAPISchema = exports.BranchUpdateSchema = exports.BranchCreateOpenAPISchema = exports.BranchCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.BranchCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    governorate: zod_1.z.nativeEnum(client_1.Governorate),
});
exports.BranchCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.BranchCreateSchema);
// export const BranchCreateMock = generateMock(BranchCreateSchema);
exports.BranchUpdateSchema = exports.BranchCreateSchema.partial();
exports.BranchUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.BranchUpdateSchema);
// export const BranchUpdateMock = generateMock(BranchUpdateSchema);
//# sourceMappingURL=branches.dto.js.map