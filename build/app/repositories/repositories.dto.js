"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryUpdateOpenAPISchema = exports.RepositoryUpdateSchema = exports.RepositoryCreateOpenAPISchema = exports.RepositoryCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.RepositoryCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    branchID: zod_1.z.coerce.number(),
    mainRepository: zod_1.z.boolean().optional(),
    type: zod_1.z.nativeEnum(client_1.RepositoryType).default(client_1.RepositoryType.EXPORT)
    // tenantID: z.string(),
});
exports.RepositoryCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.RepositoryCreateSchema);
// export const RepositoryCreateMock = generateMock(RepositoryCreateSchema);
exports.RepositoryUpdateSchema = exports.RepositoryCreateSchema.partial();
exports.RepositoryUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.RepositoryUpdateSchema);
// export const RepositoryUpdateMock = generateMock(RepositoryUpdateSchema);
//# sourceMappingURL=repositories.dto.js.map