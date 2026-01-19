"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryUpdateOpenAPISchema = exports.CategoryUpdateSchema = exports.CategoryCreateOpenAPISchema = exports.CategoryCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
// model Category {
//   id        String    @id @default(uuid())
//   title     String
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
//   Product   Product[]
// }
exports.CategoryCreateSchema = zod_1.z.object({
    title: zod_1.z.string()
});
exports.CategoryCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.CategoryCreateSchema);
// export const CategoryCreateMock = generateMock(CategoryCreateSchema);
exports.CategoryUpdateSchema = exports.CategoryCreateSchema.partial();
exports.CategoryUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.CategoryUpdateSchema);
// export const CategoryUpdateMock = generateMock(CategoryUpdateSchema);
//# sourceMappingURL=categories.dto.js.map