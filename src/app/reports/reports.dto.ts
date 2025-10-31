// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {
  Governorate,
  OrderStatus,
  ReportStatus,
  ReportType,
  SecondaryReportType,
} from "@prisma/client";
import {z} from "zod";
import {OrdersFiltersSchema} from "../orders/orders.dto";

export const ReportCreateBaseSchema = z.object({
  ordersIDs: z.array(z.coerce.string()).min(1).or(z.literal("*")),
});

export const ReportCreateSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal(ReportType.COMPANY),
      repositoryID: z.coerce.number().optional(),
      companyID: z.coerce.number(),
      baghdadDeliveryCost: z.coerce.number().optional(),
      governoratesDeliveryCost: z.coerce.number().optional(),
      secondaryType: z
        .nativeEnum(SecondaryReportType)
        .optional()
        .default(SecondaryReportType.DELIVERED),
    }),
    z.object({
      type: z.literal(ReportType.DELIVERY_AGENT),
      deliveryAgentID: z.coerce.number(),
      deliveryAgentDeliveryCost: z.coerce.number().optional(),
    }),
    z.object({
      type: z.literal(ReportType.GOVERNORATE),
      governorate: z.nativeEnum(Governorate),
      baghdadDeliveryCost: z.coerce.number().optional(),
      governoratesDeliveryCost: z.coerce.number().optional(),
    }),
    z.object({
      type: z.literal(ReportType.BRANCH),
      branchID: z.coerce.number(),
      baghdadDeliveryCost: z.coerce.number().optional(),
      governoratesDeliveryCost: z.coerce.number().optional(),
    }),
    z.object({
      type: z.literal(ReportType.CLIENT),
      clientID: z.coerce.number().optional(),
      repositoryID: z.coerce.number().optional(),
      storeID: z.coerce.number(),
      baghdadDeliveryCost: z.coerce.number().optional(),
      governoratesDeliveryCost: z.coerce.number().optional(),
      receivingAgentId: z.coerce.number().optional(),
      secondaryType: z
        .nativeEnum(SecondaryReportType)
        .optional()
        .default(SecondaryReportType.DELIVERED),
    }),
    z.object({
      type: z.literal(ReportType.REPOSITORY),
      repositoryID: z.coerce.number().optional(),
      secondaryType: z
        .nativeEnum(SecondaryReportType)
        .optional()
        .default(SecondaryReportType.DELIVERED),
      targetRepositoryId: z.coerce.number(),
      repositoryName: z.string(),
    }),
  ])
  .and(ReportCreateBaseSchema);

export type ReportCreateType = z.infer<typeof ReportCreateSchema>;

export const ReportCreateOpenAPISchema = generateSchema(ReportCreateSchema);

// export const ReportCreateMock = generateMock(ReportCreateSchema);

/* --------------------------------------------------------------- */

// remove ordersFilters and make it flat

export const ReportCreateOrdersFiltersSchema = z
  .discriminatedUnion("type", [
    z
      .object({
        type: z.literal(ReportType.COMPANY),
      })
      .merge(
        OrdersFiltersSchema.extend({
          statuses: z.preprocess(
            (val) => {
              if (typeof val === "string") {
                return val.split(",");
              }
              return val;
            },
            z.array(
              z.enum([
                OrderStatus.DELIVERED,
                OrderStatus.PARTIALLY_RETURNED,
                OrderStatus.REPLACED,
                // For company return report
                OrderStatus.RETURNED,
              ])
            )
          ),
          companyID: z.coerce.number(),
          companyReport: z.string().optional(), // Should be mandatory if ordersIDs is "*"
        })
      ),

    z
      .object({
        type: z.literal(ReportType.DELIVERY_AGENT),
      })
      .merge(
        OrdersFiltersSchema.extend({
          statuses: z.preprocess((val) => {
            if (typeof val === "string") {
              return val.split(",");
            }
            return val;
          }, z.array(z.enum([OrderStatus.DELIVERED, OrderStatus.PARTIALLY_RETURNED, OrderStatus.REPLACED]))),
          deliveryAgentID: z.coerce.number(),
          deliveryAgentReport: z.string().optional(), // Should be mandatory if ordersIDs is "*"
        })
      ),
    z
      .object({
        type: z.literal(ReportType.GOVERNORATE),
      })
      .merge(
        OrdersFiltersSchema.extend({
          statuses: z.preprocess((val) => {
            if (typeof val === "string") {
              return val.split(",");
            }
            return val;
          }, z.array(z.enum([OrderStatus.DELIVERED, OrderStatus.PARTIALLY_RETURNED, OrderStatus.REPLACED]))),
          governorate: z.nativeEnum(Governorate),
          governorateReport: z.string().optional(), // Should be mandatory if ordersIDs is "*"
        })
      ),
    z
      .object({
        type: z.literal(ReportType.BRANCH),
      })
      .merge(
        OrdersFiltersSchema.extend({
          statuses: z.preprocess((val) => {
            if (typeof val === "string") {
              return val.split(",");
            }
            return val;
          }, z.array(z.enum([OrderStatus.DELIVERED, OrderStatus.PARTIALLY_RETURNED, OrderStatus.REPLACED]))),
          branchID: z.coerce.number(),
          branchReport: z.string().optional(), // Should be mandatory if ordersIDs is "*"
        })
      ),
    z
      .object({
        type: z.literal(ReportType.CLIENT),
      })
      .merge(
        OrdersFiltersSchema.extend({
          statuses: z.preprocess(
            (val) => {
              if (typeof val === "string") {
                return val.split(",");
              }
              return val;
            },
            z.array(
              z.enum([
                OrderStatus.DELIVERED,
                OrderStatus.PARTIALLY_RETURNED,
                OrderStatus.REPLACED,
                // For company return report
                OrderStatus.RETURNED,
              ])
            )
          ),
          storeID: z.coerce.number(),
          clientReport: z.string().optional(), // Should be mandatory if ordersIDs is "*"
        })
      ),
    z
      .object({
        type: z.literal(ReportType.REPOSITORY),
      })
      .merge(
        OrdersFiltersSchema.extend({
          statuses: z.preprocess((val) => {
            if (typeof val === "string") {
              return val.split(",");
            }
            return val;
          }, z.array(z.enum([OrderStatus.RETURNED, OrderStatus.PARTIALLY_RETURNED, OrderStatus.REPLACED]))),
          repositoryID: z.coerce.number(),
          repositoryReport: z.string().optional(), // Should be mandatory if ordersIDs is "*"
        })
      ),
  ])
  .and(
    z.object({
      confirmed: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
      }, z.boolean()),
      delivered: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
      }, z.boolean().optional()),
      orderType: z.string().optional(),
    })
  );

export type ReportCreateOrdersFiltersType = z.infer<
  typeof ReportCreateOrdersFiltersSchema
>;

/* --------------------------------------------------------------- */

export const ReportUpdateSchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  confirmed: z.boolean().optional(),
  repositoryID: z.coerce.number().optional(),
});

export type ReportUpdateType = z.infer<typeof ReportUpdateSchema>;

export const ReportUpdateOpenAPISchema = generateSchema(ReportUpdateSchema);

// export const ReportUpdateMock = generateMock(ReportUpdateSchema);

/* --------------------------------------------------------------- */

export const ReportsFiltersSchema = z.object({
  page: z.coerce.number().optional().default(1),
  size: z.coerce.number().optional().default(10),
  company: z.coerce.number().optional(),
  branch: z.coerce.number().optional(),
  // TODO: Maybe change default sort
  sort: z.string().optional().default("id:desc"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  governorate: z.nativeEnum(Governorate).optional(),
  status: z.nativeEnum(ReportStatus).optional(),
  type: z.nativeEnum(ReportType).optional(),
  secondaryType: z.nativeEnum(SecondaryReportType).optional(),
  types: z.preprocess((val) => {
    if (typeof val === "string") {
      return val.split(",");
    }
    return val;
  }, z.array(z.nativeEnum(ReportType)).optional()),
  storeID: z.coerce.number().optional(),
  repositoryID: z.coerce.number().optional(),
  branchID: z.coerce.number().optional(),
  deliveryAgentID: z.coerce.number().optional(),
  companyID: z.coerce.number().optional(),
  clientID: z.coerce.number().optional(),
  createdByID: z.coerce.number().optional(),
  deleted: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return false;
  }, z.boolean().default(false).optional()),
  minified: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
});

export type ReportsFiltersType = z.infer<typeof ReportsFiltersSchema>;

export const ReportsFiltersOpenAPISchema = generateSchema(ReportsFiltersSchema);

// export const ReportsFiltersMock = generateMock(ReportsFiltersSchema);

/* --------------------------------------------------------------- */

export const ReportsReportPDFCreateSchema = z.object({
  reportsIDs: z.array(z.coerce.number()).min(1).or(z.literal("*")),
  type: z.nativeEnum(ReportType),
});

export type ReportsReportPDFCreateType = z.infer<
  typeof ReportsReportPDFCreateSchema
>;
