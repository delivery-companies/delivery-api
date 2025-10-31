// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

// model Category {
//   id        String    @id @default(uuid())
//   title     String
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
//   Product   Product[]
// }

export const CategoryCreateSchema = z.object({
    title: z.string()
});

export type CategoryCreateType = z.infer<typeof CategoryCreateSchema>;

export const CategoryCreateOpenAPISchema = generateSchema(CategoryCreateSchema);

// export const CategoryCreateMock = generateMock(CategoryCreateSchema);

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

export type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>;

export const CategoryUpdateOpenAPISchema = generateSchema(CategoryUpdateSchema);

// export const CategoryUpdateMock = generateMock(CategoryUpdateSchema);
