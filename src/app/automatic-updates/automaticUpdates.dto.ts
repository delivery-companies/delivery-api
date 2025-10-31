// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {AutomaticUpdateReturnCondition, OrderStatus} from "@prisma/client";
import {z} from "zod";

/* --------------------------------------------------------------- */

export const AutomaticUpdateCreateSchema = z.object({
  orderStatus: z.nativeEnum(OrderStatus),
  newOrderStatus: z.nativeEnum(OrderStatus),
  returnCondition: z.nativeEnum(AutomaticUpdateReturnCondition).optional(),
  updateAt: z.number().min(0).max(24),
  checkAfter: z.number().min(0).max(480),
  enabled: z.boolean().default(true),
  branchID: z.number(),
  notes: z.string().optional(),
});

export type AutomaticUpdateCreateType = z.infer<
  typeof AutomaticUpdateCreateSchema
>;

export const AutomaticUpdateCreateOpenAPISchema = generateSchema(
  AutomaticUpdateCreateSchema
);

// export const AutomaticUpdateCreateMock = generateMock(AutomaticUpdateCreateSchema);

/* --------------------------------------------------------------- */

export const AutomaticUpdateUpdateSchema =
  AutomaticUpdateCreateSchema.partial();

export type AutomaticUpdateUpdateType = z.infer<
  typeof AutomaticUpdateUpdateSchema
>;

export const AutomaticUpdateUpdateOpenAPISchema = generateSchema(
  AutomaticUpdateUpdateSchema
);

// export const AutomaticUpdateUpdateMock = generateMock(AutomaticUpdateUpdateSchema);

/* --------------------------------------------------------------- */

export const AutomaticUpdatesFiltersSchema = z.object({
  companyID: z.coerce.number().optional(),
  orderStatus: z.nativeEnum(OrderStatus).optional(),
  returnCondition: z.nativeEnum(AutomaticUpdateReturnCondition).optional(),
  newOrderStatus: z.nativeEnum(OrderStatus).optional(),
  branchID: z.coerce.number().optional(),
  enabled: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
  size: z.coerce.number().min(1).optional().default(10),
  page: z.coerce.number().min(1).optional().default(1),
  minified: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
});

export type AutomaticUpdatesFiltersType = z.infer<
  typeof AutomaticUpdatesFiltersSchema
>;

export const AutomaticUpdatesFiltersOpenAPISchema = generateSchema(
  AutomaticUpdatesFiltersSchema
);

// export const AutomaticUpdatesFiltersMock = generateMock(AutomaticUpdatesFiltersSchema);

/* --------------------------------------------------------------- */
