"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsReportPDFCreateSchema = exports.ReportsFiltersOpenAPISchema = exports.ReportsFiltersSchema = exports.ReportUpdateOpenAPISchema = exports.ReportUpdateSchema = exports.ReportCreateOrdersFiltersSchema = exports.ReportCreateOpenAPISchema = exports.ReportCreateSchema = exports.ReportCreateBaseSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const orders_dto_1 = require("../orders/orders.dto");
exports.ReportCreateBaseSchema = zod_1.z.object({
    ordersIDs: zod_1.z.array(zod_1.z.coerce.string()).min(1).or(zod_1.z.literal("*")),
});
exports.ReportCreateSchema = zod_1.z
    .discriminatedUnion("type", [
    zod_1.z.object({
        type: zod_1.z.literal(client_1.ReportType.COMPANY),
        repositoryID: zod_1.z.coerce.number().optional(),
        companyID: zod_1.z.coerce.number(),
        baghdadDeliveryCost: zod_1.z.coerce.number().optional(),
        governoratesDeliveryCost: zod_1.z.coerce.number().optional(),
        secondaryType: zod_1.z
            .nativeEnum(client_1.SecondaryReportType)
            .optional()
            .default(client_1.SecondaryReportType.DELIVERED),
    }),
    zod_1.z.object({
        type: zod_1.z.literal(client_1.ReportType.DELIVERY_AGENT),
        deliveryAgentID: zod_1.z.coerce.number(),
        deliveryAgentDeliveryCost: zod_1.z.coerce.number().optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal(client_1.ReportType.GOVERNORATE),
        governorate: zod_1.z.nativeEnum(client_1.Governorate),
        baghdadDeliveryCost: zod_1.z.coerce.number().optional(),
        governoratesDeliveryCost: zod_1.z.coerce.number().optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal(client_1.ReportType.BRANCH),
        branchID: zod_1.z.coerce.number(),
        baghdadDeliveryCost: zod_1.z.coerce.number().optional(),
        governoratesDeliveryCost: zod_1.z.coerce.number().optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal(client_1.ReportType.CLIENT),
        clientID: zod_1.z.coerce.number().optional(),
        repositoryID: zod_1.z.coerce.number().optional(),
        storeID: zod_1.z.coerce.number(),
        baghdadDeliveryCost: zod_1.z.coerce.number().optional(),
        governoratesDeliveryCost: zod_1.z.coerce.number().optional(),
        receivingAgentId: zod_1.z.coerce.number().optional(),
        secondaryType: zod_1.z
            .nativeEnum(client_1.SecondaryReportType)
            .optional()
            .default(client_1.SecondaryReportType.DELIVERED),
    }),
    zod_1.z.object({
        type: zod_1.z.literal(client_1.ReportType.REPOSITORY),
        repositoryID: zod_1.z.coerce.number().optional(),
        secondaryType: zod_1.z
            .nativeEnum(client_1.SecondaryReportType)
            .optional()
            .default(client_1.SecondaryReportType.DELIVERED),
        targetRepositoryId: zod_1.z.coerce.number(),
        repositoryName: zod_1.z.string(),
    }),
])
    .and(exports.ReportCreateBaseSchema);
exports.ReportCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ReportCreateSchema);
// export const ReportCreateMock = generateMock(ReportCreateSchema);
/* --------------------------------------------------------------- */
// remove ordersFilters and make it flat
exports.ReportCreateOrdersFiltersSchema = zod_1.z
    .discriminatedUnion("type", [
    zod_1.z
        .object({
        type: zod_1.z.literal(client_1.ReportType.COMPANY),
    })
        .merge(orders_dto_1.OrdersFiltersSchema.extend({
        statuses: zod_1.z.preprocess((val) => {
            if (typeof val === "string") {
                return val.split(",");
            }
            return val;
        }, zod_1.z.array(zod_1.z.enum([
            client_1.OrderStatus.DELIVERED,
            client_1.OrderStatus.PARTIALLY_RETURNED,
            client_1.OrderStatus.REPLACED,
            // For company return report
            client_1.OrderStatus.RETURNED,
        ]))),
        companyID: zod_1.z.coerce.number(),
        companyReport: zod_1.z.string().optional(), // Should be mandatory if ordersIDs is "*"
    })),
    zod_1.z
        .object({
        type: zod_1.z.literal(client_1.ReportType.DELIVERY_AGENT),
    })
        .merge(orders_dto_1.OrdersFiltersSchema.extend({
        statuses: zod_1.z.preprocess((val) => {
            if (typeof val === "string") {
                return val.split(",");
            }
            return val;
        }, zod_1.z.array(zod_1.z.enum([client_1.OrderStatus.DELIVERED, client_1.OrderStatus.PARTIALLY_RETURNED, client_1.OrderStatus.REPLACED]))),
        deliveryAgentID: zod_1.z.coerce.number(),
        deliveryAgentReport: zod_1.z.string().optional(), // Should be mandatory if ordersIDs is "*"
    })),
    zod_1.z
        .object({
        type: zod_1.z.literal(client_1.ReportType.GOVERNORATE),
    })
        .merge(orders_dto_1.OrdersFiltersSchema.extend({
        statuses: zod_1.z.preprocess((val) => {
            if (typeof val === "string") {
                return val.split(",");
            }
            return val;
        }, zod_1.z.array(zod_1.z.enum([client_1.OrderStatus.DELIVERED, client_1.OrderStatus.PARTIALLY_RETURNED, client_1.OrderStatus.REPLACED]))),
        governorate: zod_1.z.nativeEnum(client_1.Governorate),
        governorateReport: zod_1.z.string().optional(), // Should be mandatory if ordersIDs is "*"
    })),
    zod_1.z
        .object({
        type: zod_1.z.literal(client_1.ReportType.BRANCH),
    })
        .merge(orders_dto_1.OrdersFiltersSchema.extend({
        statuses: zod_1.z.preprocess((val) => {
            if (typeof val === "string") {
                return val.split(",");
            }
            return val;
        }, zod_1.z.array(zod_1.z.enum([client_1.OrderStatus.DELIVERED, client_1.OrderStatus.PARTIALLY_RETURNED, client_1.OrderStatus.REPLACED]))),
        branchID: zod_1.z.coerce.number(),
        branchReport: zod_1.z.string().optional(), // Should be mandatory if ordersIDs is "*"
    })),
    zod_1.z
        .object({
        type: zod_1.z.literal(client_1.ReportType.CLIENT),
    })
        .merge(orders_dto_1.OrdersFiltersSchema.extend({
        statuses: zod_1.z.preprocess((val) => {
            if (typeof val === "string") {
                return val.split(",");
            }
            return val;
        }, zod_1.z.array(zod_1.z.enum([
            client_1.OrderStatus.DELIVERED,
            client_1.OrderStatus.PARTIALLY_RETURNED,
            client_1.OrderStatus.REPLACED,
            // For company return report
            client_1.OrderStatus.RETURNED,
        ]))),
        storeID: zod_1.z.coerce.number(),
        clientReport: zod_1.z.string().optional(), // Should be mandatory if ordersIDs is "*"
    })),
    zod_1.z
        .object({
        type: zod_1.z.literal(client_1.ReportType.REPOSITORY),
    })
        .merge(orders_dto_1.OrdersFiltersSchema.extend({
        statuses: zod_1.z.preprocess((val) => {
            if (typeof val === "string") {
                return val.split(",");
            }
            return val;
        }, zod_1.z.array(zod_1.z.enum([client_1.OrderStatus.RETURNED, client_1.OrderStatus.PARTIALLY_RETURNED, client_1.OrderStatus.REPLACED]))),
        repositoryID: zod_1.z.coerce.number(),
        repositoryReport: zod_1.z.string().optional(), // Should be mandatory if ordersIDs is "*"
    })),
])
    .and(zod_1.z.object({
    confirmed: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean()),
    delivered: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    orderType: zod_1.z.string().optional(),
}));
/* --------------------------------------------------------------- */
exports.ReportUpdateSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ReportStatus).optional(),
    confirmed: zod_1.z.boolean().optional(),
    repositoryID: zod_1.z.coerce.number().optional(),
});
exports.ReportUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ReportUpdateSchema);
// export const ReportUpdateMock = generateMock(ReportUpdateSchema);
/* --------------------------------------------------------------- */
exports.ReportsFiltersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().optional().default(1),
    size: zod_1.z.coerce.number().optional().default(10),
    company: zod_1.z.coerce.number().optional(),
    branch: zod_1.z.coerce.number().optional(),
    // TODO: Maybe change default sort
    sort: zod_1.z.string().optional().default("id:desc"),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    governorate: zod_1.z.nativeEnum(client_1.Governorate).optional(),
    status: zod_1.z.nativeEnum(client_1.ReportStatus).optional(),
    type: zod_1.z.nativeEnum(client_1.ReportType).optional(),
    secondaryType: zod_1.z.nativeEnum(client_1.SecondaryReportType).optional(),
    types: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.ReportType)).optional()),
    storeID: zod_1.z.coerce.number().optional(),
    repositoryID: zod_1.z.coerce.number().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    deliveryAgentID: zod_1.z.coerce.number().optional(),
    companyID: zod_1.z.coerce.number().optional(),
    clientID: zod_1.z.coerce.number().optional(),
    createdByID: zod_1.z.coerce.number().optional(),
    deleted: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return false;
    }, zod_1.z.boolean().default(false).optional()),
    minified: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
});
exports.ReportsFiltersOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.ReportsFiltersSchema);
// export const ReportsFiltersMock = generateMock(ReportsFiltersSchema);
/* --------------------------------------------------------------- */
exports.ReportsReportPDFCreateSchema = zod_1.z.object({
    reportsIDs: zod_1.z.array(zod_1.z.coerce.number()).min(1).or(zod_1.z.literal("*")),
    type: zod_1.z.nativeEnum(client_1.ReportType),
});
//# sourceMappingURL=reports.dto.js.map