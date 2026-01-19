"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductUpdateOpenAPISchema = exports.ProductUpdateSchema = exports.ProductCreateOpenAPISchema = exports.ProductCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
exports.ProductCreateSchema = zod_1.z.object({
    title: zod_1.z.string(),
    price: zod_1.z.coerce.number().min(0),
    image: zod_1.z.string().optional(),
    weight: zod_1.z.coerce.number().min(0).optional(),
    storeID: zod_1.z.coerce.number(),
    // stock: z.number().default(0),
    stock: zod_1.z.coerce.number().min(0),
    categoryID: zod_1.z.coerce.number(),
    colors: zod_1.z.preprocess((data) => {
        if (typeof data === "string") {
            return JSON.parse(data);
        }
        return data;
    }, zod_1.z
        .array(zod_1.z.object({
        colorID: zod_1.z.coerce.number().optional(),
        // title: z.string(),
        quantity: zod_1.z.number().min(0)
    }))
        .optional()),
    sizes: zod_1.z.preprocess((data) => {
        if (typeof data === "string") {
            return JSON.parse(data);
        }
        return data;
    }, zod_1.z
        .array(zod_1.z.object({
        sizeID: zod_1.z.coerce.number().optional(),
        // title: z.string(),
        quantity: zod_1.z.number().min(0)
    }))
        .optional())
});
exports.ProductCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ProductCreateSchema);
// export const ProductCreateMock = generateMock(ProductCreateSchema);
exports.ProductUpdateSchema = exports.ProductCreateSchema.partial();
exports.ProductUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ProductUpdateSchema);
// export const ProductUpdateMock = generateMock(ProductUpdateSchema);
//# sourceMappingURL=products.dto.js.map