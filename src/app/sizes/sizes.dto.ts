// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

export const SizeCreateSchema = z.object({
    title: z.string()
});

export type SizeCreateType = z.infer<typeof SizeCreateSchema>;

export const SizeCreateOpenAPISchema = generateSchema(SizeCreateSchema);

// export const SizeCreateMock = generateMock(SizeCreateSchema);

export const SizeUpdateSchema = SizeCreateSchema.partial();

export type SizeUpdateType = z.infer<typeof SizeUpdateSchema>;

export const SizeUpdateOpenAPISchema = generateSchema(SizeUpdateSchema);

// export const SizeUpdateMock = generateMock(SizeUpdateSchema);
