"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUpdateOpenAPISchema = exports.ClientUpdateSchema = exports.ClientCreateSchemaWithUserID = exports.ClientCreateOpenAPISchema = exports.ClientCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.ClientCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    username: zod_1.z.string().min(3),
    phone: zod_1.z.string().min(6),
    role: zod_1.z.nativeEnum(client_1.ClientRole),
    token: zod_1.z.string().optional(),
    showNumbers: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    showDeliveryNumber: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    isExternal: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    password: zod_1.z.string().min(6),
    fcm: zod_1.z.string().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    repositoryID: zod_1.z.coerce.number().optional(),
    avatar: zod_1.z.string().optional(),
    companyID: zod_1.z.coerce.number().optional(),
    governoratesDeliveryCosts: zod_1.z
        .preprocess((data) => {
        if (typeof data === "string") {
            return JSON.parse(data);
        }
        return data;
    }, zod_1.z.array(zod_1.z.object({
        governorate: zod_1.z.nativeEnum(client_1.Governorate),
        cost: zod_1.z.coerce.number().max(100000).default(0),
    })))
        .optional(),
});
exports.ClientCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ClientCreateSchema);
// export const ClientCreateMock = generateMock(ClientCreateSchema);
exports.ClientCreateSchemaWithUserID = exports.ClientCreateSchema.extend({
    userID: zod_1.z.coerce.number(),
});
exports.ClientUpdateSchema = exports.ClientCreateSchema.partial();
exports.ClientUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ClientUpdateSchema);
// export const ClientUpdateMock = generateMock(ClientUpdateSchema);
//# sourceMappingURL=clients.dto.js.map