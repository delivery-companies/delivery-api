"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersReportPDFCreateSchema = exports.OrdersStatisticsFiltersOpenAPISchema = exports.OrdersStatisticsFiltersSchema = exports.OrdersFiltersOpenAPISchema = exports.OrdersFiltersSchema = exports.OrderChatNotificationCreateSchema = exports.OrderTimelineFiltersSchema = exports.OrderTimelinePieceSchema = exports.OrderTimelinePieceBaseSchema = exports.OrdersReceiptsCreateOpenAPISchema = exports.OrdersReceiptsCreateSchema = exports.OrderRepositoryConfirmByReceiptNumberOpenAPISchema = exports.OrderRepositoryConfirmByReceiptNumberSchema = exports.OrderUpdateOpenAPISchema = exports.OrderUpdateSchema = exports.OrderCreateOpenAPISchema = exports.OrderCreateSchema = exports.OrderCreateBaseSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.OrderCreateBaseSchema = zod_1.z.object({
    receiptNumber: zod_1.z.string().optional(),
    clientOrderReceiptId: zod_1.z.coerce.string().optional(),
    recipientName: zod_1.z.string().optional().default("غير معرف"),
    confirmed: zod_1.z.coerce.boolean().optional(),
    status: zod_1.z.nativeEnum(client_1.OrderStatus).default(client_1.OrderStatus.REGISTERED),
    recipientPhones: zod_1.z.array(zod_1.z.string().min(6)).optional(),
    recipientPhone: zod_1.z.string().min(6).optional(),
    recipientAddress: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    details: zod_1.z.string().optional(),
    deliveryType: zod_1.z.nativeEnum(client_1.DeliveryType).default(client_1.DeliveryType.NORMAL),
    governorate: zod_1.z.nativeEnum(client_1.Governorate),
    locationID: zod_1.z.coerce.number(),
    storeID: zod_1.z.coerce.number(),
    repositoryID: zod_1.z.coerce.number().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    clientID: zod_1.z.coerce.number().optional(),
    inquiryEmployeesIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    forwardedCompanyID: zod_1.z.coerce.number().optional(),
    weight: zod_1.z.number().optional(),
});
exports.OrderCreateSchema = zod_1.z
    .object({
    withProducts: zod_1.z.literal(false).optional(),
    totalCost: zod_1.z.number(),
    quantity: zod_1.z.number().default(1),
    weight: zod_1.z.number().optional(),
})
    .and(exports.OrderCreateBaseSchema);
exports.OrderCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.OrderCreateSchema);
// export const OrderCreateMock = generateMock(OrderCreateSchema);
/* --------------------------------------------------------------- */
// export const OrderUpdateSchema = OrderCreateSchema.partial();
exports.OrderUpdateSchema = zod_1.z
    .object({
    quantity: zod_1.z.coerce.number(),
    weight: zod_1.z.coerce.number(),
    totalCost: zod_1.z.coerce.number(),
    paidAmount: zod_1.z.coerce.number(),
    receiptNumber: zod_1.z.string(),
    processed: zod_1.z.coerce.boolean(),
    confirmed: zod_1.z.coerce.boolean(),
    discount: zod_1.z.coerce.number(),
    status: zod_1.z.nativeEnum(client_1.OrderStatus),
    processingStatus: zod_1.z.nativeEnum(client_1.ProcessingStatus),
    secondaryStatus: zod_1.z.nativeEnum(client_1.SecondaryStatus),
    deliveryAgentID: zod_1.z.coerce.number().or(zod_1.z.literal(null)).optional(),
    oldDeliveryAgentId: zod_1.z.coerce.number().or(zod_1.z.literal(null)).optional(),
    deliveryDate: zod_1.z.coerce.date(),
    recipientName: zod_1.z.string(),
    recipientPhones: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",").map((s) => s.trim());
        }
        return val;
    }, zod_1.z.array(zod_1.z.string().min(6)))
        .optional(),
    recipientPhone: zod_1.z.string().min(6),
    recipientAddress: zod_1.z.string(),
    notes: zod_1.z.string(),
    details: zod_1.z.string(),
    repositoryID: zod_1.z.coerce.number(),
    branchID: zod_1.z.coerce.number(),
    currentLocation: zod_1.z.string(),
    clientID: zod_1.z.coerce.number(),
    inquiryEmployeesIDs: zod_1.z.array(zod_1.z.coerce.number()),
    forwardedCompanyID: zod_1.z.coerce.number().optional(),
    forwardedToMainRepo: zod_1.z.boolean().optional(),
    forwardedToGov: zod_1.z.boolean().optional(),
    forwardedRepo: zod_1.z.coerce.number().optional(),
    type: zod_1.z.string().optional(),
    forwardedBranchId: zod_1.z.number().optional(),
    receivedBranchId: zod_1.z.number().optional(),
    governorate: zod_1.z.nativeEnum(client_1.Governorate),
    locationID: zod_1.z.coerce.number(),
    storeID: zod_1.z.coerce.number(),
})
    .partial();
exports.OrderUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.OrderUpdateSchema);
// export const OrderUpdateMock = generateMock(OrderUpdateSchema);
/* --------------------------------------------------------------- */
exports.OrderRepositoryConfirmByReceiptNumberSchema = zod_1.z.object({
    repositoryID: zod_1.z.coerce.number(),
});
exports.OrderRepositoryConfirmByReceiptNumberOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.OrderRepositoryConfirmByReceiptNumberSchema);
/* --------------------------------------------------------------- */
exports.OrdersReceiptsCreateSchema = zod_1.z.object({
    ordersIDs: zod_1.z.array(zod_1.z.coerce.string()).min(1),
    selectedAll: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
});
exports.OrdersReceiptsCreateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.OrdersReceiptsCreateSchema);
// export const OrdersReceiptsCreateMock = generateMock(OrdersReceiptsCreateSchema);
/* --------------------------------------------------------------- */
exports.OrderTimelinePieceBaseSchema = zod_1.z.object({
    date: zod_1.z.date(),
    message: zod_1.z.string(),
    by: zod_1.z.object({
        id: zod_1.z.coerce.number(),
        name: zod_1.z.string(),
        // role: z.nativeEnum(EmployeeRole || AdminRole || ClientRole).
    }),
});
exports.OrderTimelinePieceSchema = zod_1.z
    .discriminatedUnion("type", [
    zod_1.z.object({
        type: zod_1.z.enum([client_1.OrderTimelineType.STATUS_CHANGE]),
        old: zod_1.z
            .object({
            value: zod_1.z.nativeEnum(client_1.OrderStatus),
        })
            .or(zod_1.z.literal(null)),
        new: zod_1.z
            .object({
            value: zod_1.z.nativeEnum(client_1.OrderStatus),
        })
            .or(zod_1.z.literal(null)),
    }),
    zod_1.z.object({
        type: zod_1.z.enum([client_1.OrderTimelineType.CURRENT_LOCATION_CHANGE]),
        old: zod_1.z
            .object({
            value: zod_1.z.string(),
        })
            .or(zod_1.z.literal(null)),
        new: zod_1.z
            .object({
            value: zod_1.z.string(),
        })
            .or(zod_1.z.literal(null)),
    }),
    zod_1.z.object({
        type: zod_1.z.enum([
            client_1.OrderTimelineType.DELIVERY_AGENT_CHANGE,
            client_1.OrderTimelineType.CLIENT_CHANGE,
            client_1.OrderTimelineType.REPOSITORY_CHANGE,
            client_1.OrderTimelineType.BRANCH_CHANGE,
            client_1.OrderTimelineType.COMPANY_CHANGE,
        ]),
        old: zod_1.z
            .object({
            id: zod_1.z.coerce.number(),
            name: zod_1.z.string(),
        })
            .or(zod_1.z.literal(null)),
        new: zod_1.z
            .object({
            id: zod_1.z.coerce.number(),
            name: zod_1.z.string(),
        })
            .or(zod_1.z.literal(null)),
    }),
    zod_1.z.object({
        type: zod_1.z.enum([client_1.OrderTimelineType.PAID_AMOUNT_CHANGE]),
        old: zod_1.z
            .object({
            value: zod_1.z.coerce.number(),
        })
            .or(zod_1.z.literal(null)),
        new: zod_1.z
            .object({
            value: zod_1.z.coerce.number(),
        })
            .or(zod_1.z.literal(null)),
    }),
    zod_1.z.object({
        type: zod_1.z.enum([
            client_1.OrderTimelineType.REPORT_DELETE,
            client_1.OrderTimelineType.REPORT_CREATE,
        ]),
        old: zod_1.z
            .object({
            id: zod_1.z.coerce.number(),
            type: zod_1.z.nativeEnum(client_1.ReportType),
        })
            .or(zod_1.z.literal(null)),
        new: zod_1.z
            .object({
            id: zod_1.z.coerce.number(),
            type: zod_1.z.nativeEnum(client_1.ReportType),
        })
            .or(zod_1.z.literal(null)),
    }),
    zod_1.z.object({
        type: zod_1.z.enum([
            client_1.OrderTimelineType.ORDER_DELIVERY,
            client_1.OrderTimelineType.OTHER,
            client_1.OrderTimelineType.ORDER_CREATION,
            client_1.OrderTimelineType.ORDER_CONFIRMATION,
            client_1.OrderTimelineType.ORDER_PROCESS,
        ]),
        old: zod_1.z.literal(null),
        new: zod_1.z.literal(null),
    }),
])
    .and(exports.OrderTimelinePieceBaseSchema);
/* --------------------------------------------------------------- */
exports.OrderTimelineFiltersSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.OrderTimelineType).optional(),
    types: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderTimelineType)).optional()),
});
/* --------------------------------------------------------------- */
exports.OrderChatNotificationCreateSchema = zod_1.z.object({
    title: zod_1.z.string().optional().default("رسالة جديدة"),
    content: zod_1.z.string().optional(),
});
// export const OrderChatNotificationCreateOpenAPISchema = generateSchema(
//     OrderChatNotificationCreateSchema
// );
// export const OrderChatNotificationCreateMock = generateMock(ChatNotificationCreateSchema);
/* --------------------------------------------------------------- */
exports.OrdersFiltersSchema = zod_1.z.object({
    confirmed: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    printed: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    forwarded: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    processed: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    delivered: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    forwardedByID: zod_1.z.coerce.number().optional(),
    forwardedFromID: zod_1.z.coerce.number().optional(),
    clientID: zod_1.z.coerce.number().optional(),
    updateBy: zod_1.z.coerce.number().optional(),
    createdBy: zod_1.z.coerce.number().optional(),
    deliveryAgentID: zod_1.z.coerce.number().optional(),
    receiveingAgentID: zod_1.z.coerce.number().optional(),
    clientOrderReceiptId: zod_1.z.coerce.number().optional(),
    companyID: zod_1.z.coerce.number().optional(),
    automaticUpdateID: zod_1.z.coerce.number().optional(),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional().default("updatedAt:desc"),
    page: zod_1.z.coerce.number().optional().default(1),
    size: zod_1.z.coerce.number().optional().default(10),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    deliveryDate: zod_1.z.coerce.date().optional(),
    startDeliveryDate: zod_1.z.coerce.date().optional(),
    endDeliveryDate: zod_1.z.coerce.date().optional(),
    governorate: zod_1.z.nativeEnum(client_1.Governorate).optional(),
    statuses: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderStatus)).optional()),
    secondaryStatuses: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.SecondaryStatus)).optional()),
    secondaryStatus: zod_1.z.nativeEnum(client_1.SecondaryStatus).optional(),
    status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    processingStatus: zod_1.z.nativeEnum(client_1.ProcessingStatus).optional(),
    deliveryType: zod_1.z.nativeEnum(client_1.DeliveryType).optional(),
    storeID: zod_1.z.coerce.number().optional(),
    repositoryID: zod_1.z.coerce.number().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    productID: zod_1.z.coerce.number().optional(),
    locationID: zod_1.z.coerce.number().optional(),
    receiptNumber: zod_1.z.coerce.string().optional(),
    receiptNumbers: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.coerce.string()).optional()),
    recipientName: zod_1.z.string().optional(),
    recipientPhone: zod_1.z.string().optional(),
    recipientAddress: zod_1.z.string().optional(),
    clientReport: zod_1.z.string().optional(),
    repositoryReport: zod_1.z.string().optional(),
    branchReport: zod_1.z.string().optional(),
    deliveryAgentReport: zod_1.z.string().optional(),
    governorateReport: zod_1.z.string().optional(),
    companyReport: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    deleted: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return false;
    }, zod_1.z.boolean().default(false).optional()),
    orderID: zod_1.z.coerce.string().optional(),
    minified: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    forMobile: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    inquiryBranchesIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryLocationsIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryStoresIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryCompaniesIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryDeliveryAgentsIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryClientsIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryGovernorates: zod_1.z.array(zod_1.z.nativeEnum(client_1.Governorate)).optional(),
    inquiryStatuses: zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderStatus)).optional(),
    orderType: zod_1.z.string().optional(),
});
exports.OrdersFiltersOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.OrdersFiltersSchema);
// export const OrdersFiltersMock = generateMock(OrdersFiltersSchema);
/* --------------------------------------------------------------- */
exports.OrdersStatisticsFiltersSchema = zod_1.z.object({
    clientID: zod_1.z.coerce.number().optional(),
    branchID: zod_1.z.coerce.number().optional(),
    orderType: zod_1.z.string().optional(),
    deliveryAgentID: zod_1.z.coerce.number().optional(),
    companyID: zod_1.z.coerce.number().optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    governorate: zod_1.z.nativeEnum(client_1.Governorate).optional(),
    statuses: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.split(",");
        }
        return val;
    }, zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderStatus)).optional()),
    deliveryType: zod_1.z.nativeEnum(client_1.DeliveryType).optional(),
    storeID: zod_1.z.coerce.number().optional(),
    locationID: zod_1.z.coerce.number().optional(),
    clientReport: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    repositoryReport: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    branchReport: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    deliveryAgentReport: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    governorateReport: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    companyReport: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
    inquiryBranchesIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryLocationsIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryStoresIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryCompaniesIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryClientsIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryDeliveryAgentsIDs: zod_1.z.array(zod_1.z.coerce.number()).optional(),
    inquiryGovernorates: zod_1.z.array(zod_1.z.nativeEnum(client_1.Governorate)).optional(),
    inquiryStatuses: zod_1.z.array(zod_1.z.nativeEnum(client_1.OrderStatus)).optional(),
});
exports.OrdersStatisticsFiltersOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.OrdersStatisticsFiltersSchema);
// export const OrdersStatisticsFiltersMock = generateMock(OrdersStatisticsFiltersSchema);
/* --------------------------------------------------------------- */
exports.OrdersReportPDFCreateSchema = zod_1.z.object({
    ordersIDs: zod_1.z.array(zod_1.z.coerce.string()).min(1).or(zod_1.z.literal("*")),
    type: zod_1.z.literal("GENERAL").or(zod_1.z.literal("DELIVERY_AGENT_MANIFEST")),
});
//# sourceMappingURL=orders.dto.js.map