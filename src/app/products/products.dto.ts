// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

export const ProductCreateSchema = z.object({
    title: z.string(),
    price: z.coerce.number().min(0),
    image: z.string().optional(),
    weight: z.coerce.number().min(0).optional(),
    storeID: z.coerce.number(),
    // stock: z.number().default(0),
    stock: z.coerce.number().min(0),
    categoryID: z.coerce.number(),
    colors: z.preprocess(
        (data) => {
            if (typeof data === "string") {
                return JSON.parse(data);
            }
            return data;
        },
        z
            .array(
                z.object({
                    colorID: z.coerce.number().optional(),
                    // title: z.string(),
                    quantity: z.number().min(0)
                })
            )
            .optional()
    ),
    sizes: z.preprocess(
        (data) => {
            if (typeof data === "string") {
                return JSON.parse(data);
            }
            return data;
        },
        z
            .array(
                z.object({
                    sizeID: z.coerce.number().optional(),
                    // title: z.string(),
                    quantity: z.number().min(0)
                })
            )
            .optional()
    )
});

export type ProductCreateType = z.infer<typeof ProductCreateSchema>;

export const ProductCreateOpenAPISchema = generateSchema(ProductCreateSchema);

// export const ProductCreateMock = generateMock(ProductCreateSchema);

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;

export const ProductUpdateOpenAPISchema = generateSchema(ProductUpdateSchema);

// export const ProductUpdateMock = generateMock(ProductUpdateSchema);
