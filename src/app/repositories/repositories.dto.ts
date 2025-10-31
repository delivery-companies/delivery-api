// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { RepositoryType } from "@prisma/client";
import { z } from "zod";

export const RepositoryCreateSchema = z.object({
    name: z.string().min(3),
    branchID: z.coerce.number(),
    mainRepository:z.boolean().optional(),
    type:z.nativeEnum(RepositoryType).default(RepositoryType.EXPORT)
    // tenantID: z.string(),
});

export type RepositoryCreateType = z.infer<typeof RepositoryCreateSchema>;

export const RepositoryCreateOpenAPISchema = generateSchema(RepositoryCreateSchema);

// export const RepositoryCreateMock = generateMock(RepositoryCreateSchema);

export const RepositoryUpdateSchema = RepositoryCreateSchema.partial();

export type RepositoryUpdateType = z.infer<typeof RepositoryUpdateSchema>;

export const RepositoryUpdateOpenAPISchema = generateSchema(RepositoryUpdateSchema);

// export const RepositoryUpdateMock = generateMock(RepositoryUpdateSchema);
