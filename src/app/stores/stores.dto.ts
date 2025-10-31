// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

export const StoreCreateSchema = z.object({
    name: z.string().min(3),
    clientID: z.coerce.number(),
    clientAssistantID: z.coerce.number().optional(),
    notes: z.string().optional(),
    logo: z.string().optional()
});

export type StoreCreateType = z.infer<typeof StoreCreateSchema>;

export const StoreCreateOpenAPISchema = generateSchema(StoreCreateSchema);

// export const StoreCreateMock = generateMock(StoreCreateSchema);

export const StoreUpdateSchema = StoreCreateSchema.partial();

export type StoreUpdateType = z.infer<typeof StoreUpdateSchema>;

export const StoreUpdateOpenAPISchema = generateSchema(StoreUpdateSchema);

// export const StoreUpdateMock = generateMock(StoreUpdateSchema);
