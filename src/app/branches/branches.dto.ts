// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {Governorate} from "@prisma/client";
import {z} from "zod";

export const BranchCreateSchema = z.object({
  name: z.string().min(3),
  governorate: z.nativeEnum(Governorate),
});

export type BranchCreateType = z.infer<typeof BranchCreateSchema>;

export const BranchCreateOpenAPISchema = generateSchema(BranchCreateSchema);

// export const BranchCreateMock = generateMock(BranchCreateSchema);

export const BranchUpdateSchema = BranchCreateSchema.partial();

export type BranchUpdateType = z.infer<typeof BranchUpdateSchema>;

export const BranchUpdateOpenAPISchema = generateSchema(BranchUpdateSchema);

// export const BranchUpdateMock = generateMock(BranchUpdateSchema);
