// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

export const ColorCreateSchema = z.object({
    title: z.string(),
    code: z.string(),
});

export type ColorCreateType = z.infer<typeof ColorCreateSchema>;

export const ColorCreateOpenAPISchema = generateSchema(ColorCreateSchema);

// export const ColorCreateMock = generateMock(ColorCreateSchema);

export const ColorUpdateSchema = ColorCreateSchema.partial();

export type ColorUpdateType = z.infer<typeof ColorUpdateSchema>;

export const ColorUpdateOpenAPISchema = generateSchema(ColorUpdateSchema);

// export const ColorUpdateMock = generateMock(ColorUpdateSchema);
