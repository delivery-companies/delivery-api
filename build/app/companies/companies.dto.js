"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyUpdateOpenAPISchema = exports.CompanyUpdateSchema = exports.CompanyCreateOpenAPISchema = exports.CompanyCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
/*******************************************************************************
 * Empty string needs to be converted to null
 *******************************************************************************/
exports.CompanyCreateSchema = zod_1.z.preprocess((data) => {
    return {
        // @ts-expect-error
        companyData: JSON.parse(data.companyData),
        // @ts-expect-error
        companyManager: JSON.parse(data.companyManager)
    };
}, zod_1.z.object({
    companyData: zod_1.z.object({
        name: zod_1.z.string().min(3),
        phone: zod_1.z.string().min(6),
        // website: z.preprocess((data) => (data === "" ? undefined : data), z.string().url().optional()),
        logo: zod_1.z.preprocess((_data) => {
            return "";
        }, zod_1.z.string().optional()),
        color: zod_1.z.preprocess((data) => (data === "" ? undefined : data), zod_1.z.string().toUpperCase().length(6).optional()),
        registrationText: zod_1.z.preprocess((data) => (data === "" ? undefined : data), zod_1.z.string().optional()),
        governoratePrice: zod_1.z.coerce.number().min(0),
        deliveryAgentFee: zod_1.z.coerce.number().min(0),
        baghdadPrice: zod_1.z.coerce.number().min(0),
        additionalPriceForEvery500000IraqiDinar: zod_1.z.coerce.number().min(0),
        additionalPriceForEveryKilogram: zod_1.z.coerce.number().min(0),
        additionalPriceForRemoteAreas: zod_1.z.coerce.number().min(0),
        orderStatusAutomaticUpdate: zod_1.z.preprocess((data) => (data === "" ? undefined : data), zod_1.z.coerce.boolean().optional())
    }),
    companyManager: zod_1.z.object({
        username: zod_1.z.string().min(3),
        name: zod_1.z.string().min(3),
        password: zod_1.z.string().min(6),
        phone: zod_1.z.string().min(6),
        avatar: zod_1.z.preprocess((_data) => {
            return "";
        }, zod_1.z.string().optional())
    })
}));
exports.CompanyCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.CompanyCreateSchema);
// export const CompanyCreateMock = generateMock(CompanyCreateSchema);
//---------------------------------------------------------------
exports.CompanyUpdateSchema = zod_1.z
    .object({
    companyManagerID: zod_1.z.number().optional(),
    name: zod_1.z.string().min(3),
    phone: zod_1.z.string().min(6),
    // website: z.preprocess((data) => (data === "" ? undefined : data), z.string().url().optional()),
    logo: zod_1.z.string().optional(),
    color: zod_1.z.string().toUpperCase().length(6).optional(),
    registrationText: zod_1.z.string().optional(),
    governoratePrice: zod_1.z.coerce.number().min(0),
    deliveryAgentFee: zod_1.z.coerce.number().min(0),
    baghdadPrice: zod_1.z.coerce.number().min(0),
    additionalPriceForEvery500000IraqiDinar: zod_1.z.coerce.number().min(0),
    additionalPriceForEveryKilogram: zod_1.z.coerce.number().min(0),
    additionalPriceForRemoteAreas: zod_1.z.coerce.number().min(0),
    orderStatusAutomaticUpdate: zod_1.z.coerce.boolean().optional(),
    password: zod_1.z.string().min(6).optional()
})
    .partial();
exports.CompanyUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.CompanyUpdateSchema);
// export const CompanyUpdateMock = generateMock(CompanyUpdateSchema);
//# sourceMappingURL=companies.dto.js.map