"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationUpdateOpenAPISchema = exports.LocationUpdateSchema = exports.LocationCreateOpenAPISchema = exports.LocationCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.LocationCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    governorate: zod_1.z.nativeEnum(client_1.Governorate),
    branchID: zod_1.z.coerce.number(),
    deliveryAgentsIDs: zod_1.z.array(zod_1.z.number()),
    remote: zod_1.z.boolean().optional()
});
exports.LocationCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.LocationCreateSchema);
// export const LocationCreateMock = generateMock(LocationCreateSchema);
exports.LocationUpdateSchema = exports.LocationCreateSchema.partial();
exports.LocationUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.LocationUpdateSchema);
// export const LocationUpdateMock = generateMock(LocationUpdateSchema);
//# sourceMappingURL=locations.dto.js.map