import {z} from "zod";

export const clientReceiptCreateSchema = z.object({
  // receiptNumber:z.number(),
  storeId: z.coerce.number().optional(),
  branchId: z.coerce.number().optional(),
  receiptNumber: z.coerce.string(),
  notes: z.coerce.string(),
});
export type clientReceiptCreateType = z.infer<typeof clientReceiptCreateSchema>;
