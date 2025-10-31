// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { Governorate } from "@prisma/client";
import { z } from "zod";

export const LocationCreateSchema = z.object({
    name: z.string().min(3),
    governorate: z.nativeEnum(Governorate),
    branchID: z.coerce.number(),
    deliveryAgentsIDs: z.array(z.number()),
    remote: z.boolean().optional()
});

export type LocationCreateType = z.infer<typeof LocationCreateSchema>;

export const LocationCreateOpenAPISchema = generateSchema(LocationCreateSchema);

// export const LocationCreateMock = generateMock(LocationCreateSchema);

export const LocationUpdateSchema = LocationCreateSchema.partial();

export type LocationUpdateType = z.infer<typeof LocationUpdateSchema>;

export const LocationUpdateOpenAPISchema = generateSchema(LocationUpdateSchema);

// export const LocationUpdateMock = generateMock(LocationUpdateSchema);
