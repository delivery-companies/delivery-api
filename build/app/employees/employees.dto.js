"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesFiltersSchema = exports.EmployeeUpdateOpenAPISchema = exports.EmployeeUpdateSchema = exports.EmployeeCreateOpenAPISchema = exports.EmployeeCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.EmployeeCreateSchema = zod_1.z.object({
    username: zod_1.z.string().min(11),
    name: zod_1.z.string().min(3),
    clientAssistantRole: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().min(11),
    salary: zod_1.z.coerce.number().min(0).optional(),
    storesIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    repositoryID: zod_1.z.coerce.number().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    role: zod_1.z.nativeEnum(client_1.EmployeeRole),
    permissions: zod_1.z
        .preprocess((data) => {
        if (typeof data === "string") {
            return JSON.parse(data);
        }
        return data;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.Permission)))
        .optional(),
    orderStatus: zod_1.z
        .preprocess((data) => {
        if (typeof data === "string") {
            return JSON.parse(data);
        }
        return data;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderStatus)))
        .optional(),
    fcm: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
    idCard: zod_1.z.string().optional(),
    residencyCard: zod_1.z.string().optional(),
    orderType: zod_1.z.string().optional(),
    companyID: zod_1.z.coerce.number().optional(),
    deliveryCost: zod_1.z.coerce.number().optional(),
    inquiryBranchesIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    inquiryClientsIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    inquiryLocationsIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    inquiryStoresIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    inquiryCompaniesIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    inquiryDeliveryAgentsIDs: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.coerce.number()).optional())
        .optional(),
    inquiryGovernorates: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.Governorate)).optional())
        .optional(),
    inquiryStatuses: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderStatus)).optional())
        .optional(),
});
exports.EmployeeCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.EmployeeCreateSchema);
// export const EmployeeCreateMock = generateMock(EmployeeCreateSchema);
/* --------------------------------------------------------------- */
exports.EmployeeUpdateSchema = exports.EmployeeCreateSchema.partial();
exports.EmployeeUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.EmployeeUpdateSchema);
// export const EmployeeUpdateMock = generateMock(EmployeeUpdateSchema);
/* --------------------------------------------------------------- */
exports.EmployeesFiltersSchema = zod_1.z
    .object({
    companyID: zod_1.z.coerce.number().optional(),
    page: zod_1.z.coerce.number().optional().default(1),
    size: zod_1.z.coerce.number().optional().default(10),
    ordersStartDate: zod_1.z.coerce.date().optional(),
    ordersEndDate: zod_1.z.coerce.date().optional(),
    roles: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.EmployeeRole)).optional()),
    permissions: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.Permission)).optional()),
    role: zod_1.z.nativeEnum(client_1.EmployeeRole).optional(),
    name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    clientId: zod_1.z.coerce.number().optional(),
    locationID: zod_1.z.coerce.number().optional(),
    deleted: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return false;
    }, zod_1.z.boolean().default(false)),
    minified: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
})
    .transform((data) => {
    if (data.size > 500 && data.minified !== true) {
        return {
            ...data,
            size: 10,
        };
    }
    return data;
});
//# sourceMappingURL=employees.dto.js.map