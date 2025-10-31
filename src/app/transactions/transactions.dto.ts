import {z} from "zod";
import {TransactionType} from "@prisma/client";

export const TransactionCreateSchema = z.object({
  type: z.nativeEnum(TransactionType),
  for: z.string(),
  paidAmount: z.coerce.number().optional(),
  employeeId: z.coerce.number().optional(),
  createdById: z.coerce.number().optional(),
});

export const TransactionUpdateSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  for: z.string().optional(),
  employeeId: z.number().optional(),
});

export type TransactionCreateType = z.infer<typeof TransactionCreateSchema>;
export type TransactionUpdateType = z.infer<typeof TransactionUpdateSchema>;
