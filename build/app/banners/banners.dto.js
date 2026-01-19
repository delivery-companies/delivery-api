"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerUpdateOpenAPISchema = exports.BannerUpdateSchema = exports.BannerCreateOpenAPISchema = exports.BannerCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
exports.BannerCreateSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    url: zod_1.z.string().optional(),
});
exports.BannerCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.BannerCreateSchema);
// export const BannerCreateMock = generateMock(BannerCreateSchema);
exports.BannerUpdateSchema = exports.BannerCreateSchema.partial();
exports.BannerUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.BannerUpdateSchema);
// export const BannerUpdateMock = generateMock(BannerUpdateSchema);
//# sourceMappingURL=banners.dto.js.map