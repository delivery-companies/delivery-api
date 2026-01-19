"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRepository = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../database/db");
const AppError_1 = require("../../lib/AppError");
const orders_responses_1 = require("./orders.responses");
const server_1 = require("../../server");
const messages_controller_1 = require("../messages/messages.controller");
const messageController = new messages_controller_1.MessagesController();
let counter = 0;
class OrdersRepository {
    generateRandomId() {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Baghdad" }));
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const datePart = `${month}${day}`;
        // Use last 3 digits of timestamp → more space for counter
        const ts = Date.now().toString().slice(-3);
        // 2-digit counter (00–99)
        counter = (counter + 1) % 100;
        const ctr = String(counter).padStart(2, "0");
        // Final ID → same length as before
        return `${datePart}${ts}${ctr}`;
    }
    async generateUniqueOrderId() {
        while (true) {
            const id = this.generateRandomId();
            const exists = await db_1.prisma.order.findUnique({
                where: { id },
            });
            if (!exists)
                return id;
        }
    }
    async getDeliverCost(clientId, governorate) {
        const client = await db_1.prisma.client.findUnique({
            where: {
                id: clientId,
            },
            select: {
                governoratesDeliveryCosts: true,
                branchId: true,
            },
        });
        if (!client) {
            throw new AppError_1.AppError("العميل غير موجود", 400);
        }
        const governoratesDeliveryCosts = client.governoratesDeliveryCosts;
        return (governoratesDeliveryCosts.find((governorateDeliveryCost) => {
            return governorateDeliveryCost.governorate === governorate;
        })?.cost || 0);
    }
    async createOrder(data) {
        let totalCost = 0;
        let quantity = 0;
        let weight = data.orderData.weight || 0;
        let status = "REGISTERED";
        let secondaryStatus = "WITH_CLIENT";
        let receivingBranchId = undefined;
        let forwardedBranchId = undefined;
        const client = await db_1.prisma.client.findUnique({
            where: {
                id: data.clientID,
            },
            select: {
                governoratesDeliveryCosts: true,
                branchId: true,
            },
        });
        if (!client) {
            throw new AppError_1.AppError("العميل غير موجود", 400);
        }
        if (data.loggedInUser.role !== "CLIENT" &&
            data.loggedInUser.role !== "CLIENT_ASSISTANT") {
            if (data.loggedInUser.mainRepository) {
                const repository = await db_1.prisma.repository.findFirst({
                    where: {
                        type: "EXPORT",
                        branch: {
                            id: data.orderData.branchID,
                        },
                    },
                    select: {
                        id: true,
                    },
                });
                if (!repository) {
                    throw new AppError_1.AppError("لا يوجد مخزن فرز مرتبط بالفرع", 404);
                }
                receivingBranchId = data.orderData.branchID;
                forwardedBranchId = client?.branchId || undefined;
                data.orderData.repositoryID = repository.id;
                secondaryStatus = "IN_CAR";
                status = "IN_GOV_REPOSITORY";
            }
            else {
                if (data.orderData.branchID === client.branchId) {
                    const repository = await db_1.prisma.repository.findFirst({
                        where: {
                            type: "EXPORT",
                            branch: {
                                id: data.orderData.branchID,
                            },
                        },
                        select: {
                            id: true,
                        },
                    });
                    data.orderData.repositoryID = repository?.id;
                    secondaryStatus = "IN_REPOSITORY";
                    status = "IN_GOV_REPOSITORY";
                }
                else {
                    const repository = await db_1.prisma.repository.findFirst({
                        where: {
                            type: "EXPORT",
                            mainRepository: true,
                            companyId: data.companyID,
                        },
                        select: {
                            id: true,
                        },
                    });
                    receivingBranchId = data.orderData.branchID;
                    forwardedBranchId = client?.branchId || undefined;
                    data.orderData.repositoryID = repository?.id;
                    secondaryStatus = "IN_CAR";
                    status = "IN_MAIN_REPOSITORY";
                }
            }
        }
        // Calculate delivery cost
        let deliveryCost = 0;
        const governoratesDeliveryCosts = client.governoratesDeliveryCosts;
        if (governoratesDeliveryCosts) {
            deliveryCost =
                governoratesDeliveryCosts.find((governorateDeliveryCost) => {
                    return (governorateDeliveryCost.governorate === data.orderData.governorate);
                })?.cost || 0;
        }
        // Add Additional costs
        const companyAdditionalPrices = await db_1.prisma.company.findUnique({
            where: {
                id: data.companyID,
            },
            select: {
                additionalPriceForEvery500000IraqiDinar: true,
                additionalPriceForEveryKilogram: true,
                additionalPriceForRemoteAreas: true,
            },
        });
        deliveryCost +=
            companyAdditionalPrices?.additionalPriceForEvery500000IraqiDinar
                ? companyAdditionalPrices?.additionalPriceForEvery500000IraqiDinar *
                    Math.ceil(totalCost / 500000)
                : 0;
        deliveryCost += companyAdditionalPrices?.additionalPriceForEveryKilogram
            ? weight * companyAdditionalPrices?.additionalPriceForEveryKilogram
            : 0;
        if (data.orderData.locationID) {
            const location = await db_1.prisma.location.findUnique({
                where: {
                    id: data.orderData.locationID,
                },
                select: {
                    remote: true,
                },
            });
            deliveryCost += location?.remote
                ? companyAdditionalPrices?.additionalPriceForRemoteAreas || 0
                : 0;
        }
        let randomId = await this.generateUniqueOrderId();
        // Create order
        const createdOrder = await db_1.prisma.order.create({
            data: {
                id: randomId,
                totalCost: data.orderData.withProducts === false
                    ? data.orderData.totalCost
                    : totalCost,
                deliveryCost: deliveryCost,
                quantity: data.orderData.withProducts === false
                    ? data.orderData.quantity
                    : quantity,
                weight: weight,
                recipientName: data.orderData.recipientName,
                recipientPhones: data.orderData.recipientPhones
                    ? data.orderData.recipientPhones
                    : data.orderData.recipientPhone
                        ? [data.orderData.recipientPhone]
                        : undefined,
                receiptNumber: data.orderData.receiptNumber
                    ? data.orderData.receiptNumber
                    : randomId,
                recipientAddress: data.orderData.recipientAddress,
                clientNotes: data.orderData.notes,
                details: data.orderData.details,
                deliveryType: data.orderData.deliveryType,
                printed: data.orderData.clientOrderReceiptId ? true : false,
                receivedBranchId: receivingBranchId || undefined,
                forwardedBranchId: forwardedBranchId || undefined,
                clientOrderReceipt: data.orderData.clientOrderReceiptId
                    ? {
                        connect: {
                            id: +data.orderData.clientOrderReceiptId,
                        },
                    }
                    : undefined,
                governorate: data.orderData.governorate,
                branch: data.orderData.branchID
                    ? {
                        connect: {
                            id: data.orderData.branchID,
                        },
                    }
                    : undefined,
                repository: data.orderData.repositoryID
                    ? {
                        connect: {
                            id: data.orderData.repositoryID,
                        },
                    }
                    : undefined,
                location: {
                    connect: {
                        id: data.orderData.locationID,
                    },
                },
                store: {
                    connect: {
                        id: data.orderData.storeID,
                    },
                },
                company: {
                    connect: {
                        id: data.orderData.forwardedCompanyID
                            ? data.orderData.forwardedCompanyID
                            : data.companyID,
                    },
                },
                forwarded: data.orderData.forwardedCompanyID ? true : undefined,
                forwardedBy: data.orderData.forwardedCompanyID
                    ? {
                        connect: {
                            id: data.loggedInUser.id,
                        },
                    }
                    : undefined,
                forwardedAt: data.orderData.forwardedCompanyID ? new Date() : undefined,
                forwardedFrom: data.orderData.forwardedCompanyID
                    ? {
                        connect: {
                            id: data.companyID,
                        },
                    }
                    : undefined,
                client: {
                    connect: {
                        id: data.clientID,
                    },
                },
                ordersInquiryEmployees: data.orderData.inquiryEmployeesIDs
                    ? {
                        create: data.orderData.inquiryEmployeesIDs?.map((id) => {
                            return {
                                inquiryEmployee: {
                                    connect: {
                                        id: id,
                                    },
                                },
                            };
                        }),
                    }
                    : undefined,
                confirmed: data.orderData.confirmed,
                receivedAt: data.orderData.confirmed ? new Date() : undefined,
                status: status,
                secondaryStatus: secondaryStatus,
                deliveryAgent: undefined,
                orderProducts: undefined,
            },
            select: orders_responses_1.orderSelect,
        });
        await db_1.prisma.chat.create({
            data: {
                orderId: createdOrder.id,
                numberOfMessages: 0,
            },
        });
        return (0, orders_responses_1.orderReform)(createdOrder);
    }
    async getAllOrdersPaginated(data) {
        let startDate = new Date();
        let endDate = new Date();
        if (data.filters.startDate) {
            startDate = new Date(data.filters.startDate);
            startDate.setUTCDate(startDate.getUTCDate() - 1);
            startDate.setHours(21, 0, 0, 0);
        }
        if (data.filters.endDate) {
            endDate = new Date(data.filters.endDate);
            endDate.setHours(21, 0, 0, 0);
        }
        let deliveryStartDate = new Date();
        let deliveryEndDate = new Date();
        if (data.filters.startDeliveryDate) {
            deliveryStartDate = new Date(data.filters.startDeliveryDate);
        }
        if (data.filters.endDeliveryDate) {
            deliveryEndDate = new Date(data.filters.endDeliveryDate);
        }
        const where = data.loggedInUser?.role === "INQUIRY_EMPLOYEE"
            ? {
                AND: [
                    // Search by receiptNumber, recipientName, recipientPhone, recipientAddress
                    {
                        OR: [
                            {
                                receiptNumber: data.filters.search
                                    ? data.filters.search
                                    : undefined,
                            },
                            {
                                branchReportId: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : +data.filters.search
                                    : undefined,
                            },
                            {
                                clientReport: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : {
                                                some: {
                                                    id: +data.filters.search,
                                                },
                                            }
                                    : undefined,
                            },
                            {
                                repositoryReport: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : {
                                                some: {
                                                    id: +data.filters.search,
                                                },
                                            }
                                    : undefined,
                            },
                            {
                                companyReport: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : {
                                                some: {
                                                    id: +data.filters.search,
                                                },
                                            }
                                    : undefined,
                            },
                            {
                                deliveryAgentReportId: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : +data.filters.search
                                    : undefined,
                            },
                            {
                                governorateReportId: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : +data.filters.search
                                    : undefined,
                            },
                            {
                                recipientName: {
                                    contains: data.filters.search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                recipientPhones: data.filters.search
                                    ? {
                                        has: data.filters.search,
                                    }
                                    : undefined,
                            },
                            {
                                recipientAddress: {
                                    contains: data.filters.search,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    {
                        deleted: data.filters.deleted,
                    },
                    // Filter by orderID
                    {
                        id: data.filters.orderID,
                    },
                    {
                        confirmed: data.filters.confirmed,
                    },
                    {
                        processed: data.filters.processed,
                    },
                    {
                        processingStatus: data.filters.processingStatus,
                    },
                    {
                        status: data.filters.statuses
                            ? { in: data.filters.statuses }
                            : undefined,
                    },
                    {
                        status: data.filters.status,
                    },
                    {
                        governorate: data.filters.inquiryGovernorates
                            ? {
                                in: data.filters.inquiryGovernorates,
                            }
                            : undefined,
                    },
                    {
                        governorate: data.filters.governorate,
                    },
                    // Filter by notes
                    {
                        notes: data.filters.notes,
                    },
                    {
                        branch: data.filters.orderType
                            ? undefined
                            : data.filters.inquiryBranchesIDs
                                ? {
                                    id: {
                                        in: data.filters.inquiryBranchesIDs,
                                    },
                                }
                                : data.loggedInUser.mainRepository
                                    ? undefined
                                    : {
                                        id: data.loggedInUser.branchId,
                                    },
                    },
                    {
                        branchId: data.filters.orderType
                            ? undefined
                            : data.filters.branchID,
                    },
                    {
                        clientId: data.filters.clientID,
                    },
                    {
                        deliveryAgentId: data.filters.deliveryAgentID,
                    },
                    {
                        store: data.filters.inquiryStoresIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryStoresIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        storeId: data.filters.storeID,
                    },
                    {
                        locationId: data.filters.locationID,
                    },
                    {
                        company: {
                            id: data.filters.companyID,
                        },
                    },
                    // Filter by startDate
                    {
                        createdAt: data.filters.startDate
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    // Filter by endDate
                    {
                        createdAt: data.filters.endDate
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    {
                        // gte deliveryDate day start time (00:00:00) and lte deliveryDate day end time (23:59:59)
                        updatedAt: data.filters.deliveryDate
                            ? {
                                gte: new Date(new Date(data.filters.deliveryDate).setHours(0, 0, 0, 0)),
                                lte: new Date(new Date(data.filters.deliveryDate).setHours(23, 59, 59, 999)),
                            }
                            : undefined,
                    },
                    {
                        location: data.filters.inquiryLocationsIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryLocationsIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        deliveryAgent: data.filters.inquiryDeliveryAgentsIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryDeliveryAgentsIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        AND: [
                            data.filters.clientReport === "true"
                                ? {
                                    clientReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.clientReport === "false"
                                    ? [
                                        {
                                            clientReport: {
                                                none: {},
                                            },
                                        },
                                        {
                                            clientReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by repositoryReport
                    {
                        AND: [
                            data.filters.repositoryReport === "true"
                                ? {
                                    repositoryReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.repositoryReport === "false"
                                    ? [
                                        {
                                            repositoryReport: {
                                                none: {},
                                            },
                                        },
                                        {
                                            repositoryReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by branchReport
                    {
                        AND: [
                            data.filters.branchReport === "true"
                                ? {
                                    branchReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.branchReport === "false"
                                    ? [
                                        {
                                            branchReport: {
                                                none: {},
                                            },
                                        },
                                        {
                                            branchReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by deliveryAgentReport
                    {
                        AND: [
                            {
                                AND: data.filters.deliveryAgentReport === "true"
                                    ? [
                                        { deliveryAgentReport: { isNot: null } },
                                        {
                                            deliveryAgentReport: {
                                                report: { deleted: false },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                            {
                                OR: data.filters.deliveryAgentReport === "false"
                                    ? [
                                        { deliveryAgentReport: { is: null } },
                                        {
                                            deliveryAgentReport: {
                                                report: { deleted: true },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by governorateReport
                    {
                        AND: [
                            {
                                AND: data.filters.governorateReport === "true"
                                    ? [
                                        { governorateReport: { isNot: null } },
                                        {
                                            governorateReport: { report: { deleted: false } },
                                        },
                                    ]
                                    : undefined,
                            },
                            {
                                OR: data.filters.governorateReport === "false"
                                    ? [
                                        { governorateReport: { is: null } },
                                        {
                                            governorateReport: { report: { deleted: true } },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by companyReport
                    {
                        AND: [
                            data.filters.companyReport === "true"
                                ? {
                                    companyReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.companyReport === "false"
                                    ? [
                                        {
                                            companyReport: {
                                                none: {},
                                            },
                                        },
                                        {
                                            companyReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    {
                        forwardedBranchId: data.filters.orderType === "forwarded"
                            ? data.filters.branchID
                            : undefined,
                    },
                    {
                        receivedBranchId: data.filters.orderType === "received"
                            ? data.filters.branchID
                            : undefined,
                    },
                    {
                        forwardedBranchId: data.filters.orderType === "forwarded" &&
                            data.filters.inquiryBranchesIDs
                            ? { in: data.filters.inquiryBranchesIDs }
                            : data.filters.orderType === "forwarded"
                                ? { not: null }
                                : undefined,
                    },
                    {
                        receivedBranchId: data.filters.orderType === "receiving" &&
                            data.filters.inquiryBranchesIDs
                            ? { in: data.filters.inquiryBranchesIDs }
                            : data.filters.orderType === "receiving"
                                ? { not: null }
                                : undefined,
                    },
                ],
            }
            : {
                AND: [
                    // Search by receiptNumber, recipientName, recipientPhone, recipientAddress
                    {
                        OR: [
                            {
                                receiptNumber: data.filters.search
                                    ? data.filters.search
                                    : undefined,
                            },
                            {
                                branchReportId: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : +data.filters.search
                                    : undefined,
                            },
                            {
                                clientReport: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : {
                                                some: {
                                                    id: +data.filters.search,
                                                },
                                            }
                                    : undefined,
                            },
                            {
                                repositoryReport: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : {
                                                some: {
                                                    id: +data.filters.search,
                                                },
                                            }
                                    : undefined,
                            },
                            {
                                companyReport: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : {
                                                some: {
                                                    id: +data.filters.search,
                                                },
                                            }
                                    : undefined,
                            },
                            {
                                deliveryAgentReportId: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : +data.filters.search
                                    : undefined,
                            },
                            {
                                governorateReportId: data.filters.search
                                    ? Number.isNaN(+data.filters.search)
                                        ? undefined
                                        : data.filters.search.length > 9
                                            ? undefined
                                            : +data.filters.search
                                    : undefined,
                            },
                            {
                                recipientName: {
                                    contains: data.filters.search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                recipientPhones: data.filters.search
                                    ? {
                                        has: data.filters.search,
                                    }
                                    : undefined,
                            },
                            {
                                recipientAddress: {
                                    contains: data.filters.search,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    {
                        OR: [
                            {
                                company: {
                                    id: data.filters.companyID,
                                },
                            },
                            {
                                forwardedFrom: {
                                    id: data.filters.inquiryCompaniesIDs
                                        ? {
                                            in: [
                                                ...data.filters.inquiryCompaniesIDs,
                                                //   data.filters.companyID as number
                                            ],
                                        }
                                        : data.filters.forwarded &&
                                            data.filters.forwardedFromID === undefined
                                            ? undefined
                                            : data.filters.governorate
                                                ? undefined
                                                : data.filters.companyID,
                                },
                            },
                        ],
                    },
                    // Filter by companyID
                    {
                        confirmed: data.filters.confirmed,
                    },
                    {
                        processed: data.filters.processed,
                    },
                    {
                        processingStatus: data.filters.processingStatus,
                    },
                    // Filter by orderID
                    {
                        id: data.filters.orderID,
                    },
                    // Filter by status
                    {
                        status: data.filters.statuses
                            ? { in: data.filters.statuses }
                            : undefined,
                    },
                    {
                        deliveryDate: data.filters.startDeliveryDate
                            ? {
                                gte: deliveryStartDate,
                            }
                            : undefined,
                    },
                    // Filter by endDate
                    {
                        deliveryDate: data.filters.endDeliveryDate
                            ? {
                                lt: deliveryEndDate,
                            }
                            : undefined,
                    },
                    {
                        status: data.filters.status === "RETURNED" &&
                            data.loggedInUser?.role === "RECEIVING_AGENT"
                            ? { in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"] }
                            : data.filters.status,
                    },
                    // Filter by deliveryType
                    {
                        deliveryType: data.filters.deliveryType,
                    },
                    // Filter by deliveryDate
                    {
                        // gte deliveryDate day start time (00:00:00) and lte deliveryDate day end time (23:59:59)
                        updatedAt: data.filters.deliveryDate
                            ? {
                                gte: new Date(new Date(data.filters.deliveryDate).setHours(0, 0, 0, 0)),
                                lte: new Date(new Date(data.filters.deliveryDate).setHours(23, 59, 59, 999)),
                            }
                            : undefined,
                    },
                    // Filter by deliveryAgentID
                    {
                        deliveryAgent: {
                            id: data.filters.deliveryAgentID,
                        },
                    },
                    // Filter by clientID
                    {
                        client: {
                            id: data.filters.clientID,
                        },
                    },
                    // Filter by storeID
                    {
                        store: {
                            id: data.loggedInUser?.role === "CLIENT_ASSISTANT" ||
                                data.loggedInUser?.role === "EMPLOYEE_CLIENT_ASSISTANT"
                                ? { in: data.filters.inquiryStoresIDs }
                                : data.filters.storeID,
                        },
                    },
                    {
                        orderProducts: data.filters.productID
                            ? {
                                some: {
                                    product: {
                                        id: data.filters.productID,
                                    },
                                },
                            }
                            : undefined,
                    },
                    // Filter by locationID
                    {
                        location: {
                            id: data.filters.locationID,
                        },
                    },
                    {
                        receiptNumber: data.filters.receiptNumber,
                    },
                    {
                        printed: data.filters.printed,
                    },
                    {
                        receiptNumber: data.filters.receiptNumbers
                            ? { in: data.filters.receiptNumbers }
                            : undefined,
                    },
                    // Filter by recipientName
                    {
                        recipientName: data.filters.recipientName,
                    },
                    // Filter by recipientPhone
                    {
                        recipientPhones: data.filters.recipientPhone
                            ? {
                                has: data.filters.recipientPhone,
                            }
                            : undefined,
                    },
                    // Filter by recipientAddress
                    {
                        recipientAddress: data.filters.recipientAddress,
                    },
                    // Filter by notes
                    {
                        notes: data.filters.notes,
                    },
                    // Filter by startDate
                    {
                        createdAt: data.filters.startDate
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    // Filter by endDate
                    {
                        createdAt: data.filters.endDate
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    // Filter by deleted
                    {
                        deleted: data.filters.deleted,
                    },
                    // Filter by clientReport
                    {
                        AND: [
                            data.filters.clientReport === "true"
                                ? {
                                    clientReport: {
                                        some: {
                                            secondaryType: data.filters.delivered &&
                                                data.filters.orderType === "forwarded"
                                                ? "DELIVERED"
                                                : undefined,
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.clientReport === "false"
                                    ? [
                                        {
                                            clientReport: {
                                                none: {
                                                    secondaryType: data.filters.delivered
                                                        ? "DELIVERED"
                                                        : undefined,
                                                },
                                            },
                                        },
                                        {
                                            clientReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by repositoryReport
                    {
                        AND: [
                            data.filters.repositoryReport === "true"
                                ? {
                                    repositoryReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.repositoryReport === "false"
                                    ? [
                                        {
                                            repositoryReport: {
                                                none: {},
                                            },
                                        },
                                        {
                                            repositoryReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by branchReport
                    {
                        AND: [
                            data.filters.branchReport === "true"
                                ? {
                                    branchReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.branchReport === "false"
                                    ? [
                                        {
                                            branchReport: {
                                                none: {
                                                    branchId: data.filters.branchID,
                                                    type: data.filters.orderType,
                                                },
                                            },
                                        },
                                        {
                                            branchReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by deliveryAgentReport
                    {
                        AND: [
                            {
                                AND: data.filters.deliveryAgentReport === "true"
                                    ? [
                                        { deliveryAgentReport: { isNot: null } },
                                        {
                                            deliveryAgentReport: {
                                                report: { deleted: false },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                            {
                                OR: data.filters.deliveryAgentReport === "false"
                                    ? [
                                        { deliveryAgentReport: { is: null } },
                                        {
                                            deliveryAgentReport: {
                                                report: { deleted: true },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by governorateReport
                    {
                        AND: [
                            {
                                AND: data.filters.governorateReport === "true"
                                    ? [
                                        { governorateReport: { isNot: null } },
                                        {
                                            governorateReport: { report: { deleted: false } },
                                        },
                                    ]
                                    : undefined,
                            },
                            {
                                OR: data.filters.governorateReport === "false"
                                    ? [
                                        { governorateReport: { is: null } },
                                        {
                                            governorateReport: { report: { deleted: true } },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by companyReport
                    {
                        AND: [
                            data.filters.companyReport === "true"
                                ? {
                                    companyReport: {
                                        some: {
                                            report: {
                                                deleted: false,
                                            },
                                        },
                                    },
                                }
                                : {},
                            {
                                OR: data.filters.companyReport === "false"
                                    ? [
                                        {
                                            companyReport: {
                                                none: {},
                                            },
                                        },
                                        {
                                            companyReport: {
                                                some: {
                                                    report: {
                                                        deleted: true,
                                                    },
                                                },
                                            },
                                        },
                                    ]
                                    : undefined,
                            },
                        ],
                    },
                    // Filter by automaticUpdateID
                    {
                        automaticUpdate: {
                            id: data.filters.automaticUpdateID,
                        },
                    },
                    {
                        forwarded: data.filters.forwarded,
                    },
                    {
                        processed: data.filters.processed,
                    },
                    {
                        forwardedBy: {
                            id: data.filters.forwardedByID,
                        },
                    },
                    {
                        forwardedFrom: {
                            id: data.filters.forwardedFromID,
                        },
                    },
                    {
                        OR: data.filters.orderType && data.filters.orderType !== "inside"
                            ? []
                            : data.filters.governorate &&
                                data.filters.governorateReport === "false"
                                ? [
                                    {
                                        branch: {
                                            governorate: data.filters.governorate,
                                        },
                                    },
                                ]
                                : data.loggedInUser?.role !== "DELIVERY_AGENT"
                                    ? [
                                        {
                                            branch: data.filters.inquiryBranchesIDs
                                                ? {
                                                    id: {
                                                        in: data.filters.inquiryBranchesIDs,
                                                    },
                                                }
                                                : {
                                                    id: data.filters.branchID,
                                                },
                                        },
                                        {
                                            client: data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                                !data.loggedInUser?.mainRepository
                                                ? {
                                                    branchId: data.loggedInUser?.branchId,
                                                }
                                                : undefined,
                                        },
                                    ]
                                    : undefined,
                    },
                    {
                        governorate: data.filters.governorate &&
                            data.filters.governorateReport === "false"
                            ? undefined
                            : data.filters.governorate,
                    },
                    {
                        repository: data.filters.secondaryStatus === "IN_REPOSITORY"
                            ? {
                                mainRepository: false,
                            }
                            : data.filters.secondaryStatus === "IN_CAR"
                                ? {
                                    mainRepository: true,
                                }
                                : {
                                    id: data.filters.repositoryID,
                                },
                    },
                    {
                        secondaryStatus: data.filters.secondaryStatus === "WITH_AGENT"
                            ? "WITH_AGENT"
                            : data.filters.secondaryStatus === "IN_REPOSITORY" ||
                                data.filters.secondaryStatus === "IN_CAR"
                                ? "IN_REPOSITORY"
                                : data.filters.secondaryStatus,
                    },
                    {
                        timeline: {
                            some: data.filters.updateBy
                                ? {
                                    by: {
                                        path: ["id"],
                                        equals: data.filters.updateBy, // number: 295
                                    },
                                }
                                : data.filters.createdBy
                                    ? {
                                        type: "ORDER_CREATION",
                                        by: {
                                            path: ["id"],
                                            equals: data.filters.createdBy, // number: 295
                                        },
                                    }
                                    : undefined,
                        },
                    },
                    // {
                    //   forwardedBranchId:
                    //     data.filters.orderType === "forwarded"
                    //       ? data.filters.branchID
                    //       : undefined,
                    // },
                    // {
                    //   receivedBranchId:
                    //     data.filters.orderType === "received"
                    //       ? data.filters.branchID
                    //       : undefined,
                    // },
                    {
                        OR: [
                            {
                                AND: [
                                    {
                                        forwardedBranchId: data.filters.orderType === "forwarded"
                                            ? data.filters.branchID
                                            : undefined,
                                    },
                                    {
                                        receivedBranchId: data.filters.orderType === "received"
                                            ? data.filters.branchID
                                            : undefined,
                                    },
                                ],
                            },
                            data.filters.orderType === "forwarded" ||
                                data.filters.orderType === "received"
                                ? {
                                    AND: [
                                        {
                                            branch: {
                                                id: data.filters.branchID,
                                                governorate: "BAGHDAD",
                                            },
                                        },
                                        {
                                            receivedBranchId: null,
                                        },
                                        {
                                            forwardedBranchId: null,
                                        },
                                    ],
                                }
                                : {},
                            // {
                            //   branch: {
                            //     governorate: "BAGHDAD",
                            //     id: data.filters.branchID,
                            //   },
                            // },
                        ],
                    },
                    {
                        forwardedBranchId: data.filters.orderType === "forwardedAll" &&
                            (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                data.loggedInUser?.mainRepository) &&
                            data.filters.branchID
                            ? data.filters.branchID
                            : data.filters.orderType === "forwardedAll" &&
                                (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                    data.loggedInUser?.mainRepository)
                                ? {
                                    not: null,
                                }
                                : data.filters.orderType === "forwardedAll"
                                    ? data.loggedInUser?.branchId
                                    : data.filters.orderType === "receivedAll" &&
                                        data.filters.branchID &&
                                        data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                        !data.loggedInUser?.mainCompany
                                        ? data.filters.branchID
                                        : data.filters.orderType === "inside"
                                            ? { equals: null }
                                            : undefined,
                    },
                    {
                        receivedBranchId: data.filters.orderType === "receivedAll" &&
                            (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                data.loggedInUser?.mainRepository) &&
                            data.filters.branchID
                            ? data.filters.branchID
                            : data.filters.orderType === "receivedAll" &&
                                (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                    data.loggedInUser?.mainRepository)
                                ? {
                                    not: null,
                                }
                                : data.filters.orderType === "forwardedAll" &&
                                    data.filters.branchID &&
                                    data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                    !data.loggedInUser?.mainCompany
                                    ? data.filters.branchID
                                    : data.filters.orderType === "receivedAll"
                                        ? data.loggedInUser?.branchId
                                        : data.filters.orderType === "inside"
                                            ? { equals: null }
                                            : undefined,
                    },
                ],
            };
        if (data.filters.minified === true || data.filters.forMobile === true) {
            const paginatedOrders = await db_1.prisma.order.findManyPaginated({
                where: data.loggedInUser?.role === "RECEIVING_AGENT" &&
                    data.filters.status === "RETURNED"
                    ? {
                        AND: [
                            {
                                status: {
                                    in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
                                },
                            },
                            {
                                clientReport: {
                                    some: {
                                        receivingAgentId: data.loggedInUser.id,
                                        report: {
                                            deleted: false,
                                        },
                                    },
                                },
                            },
                            {
                                client: {
                                    id: data.filters.clientID,
                                },
                            },
                        ],
                    }
                    : {
                        ...where,
                        OR: (data.loggedInUser?.role === "CLIENT" ||
                            data.loggedInUser?.role === "INQUIRY_EMPLOYEE" ||
                            data.loggedInUser?.role === "EMPLOYEE_CLIENT_ASSISTANT" ||
                            data.loggedInUser?.role === "CLIENT_ASSISTANT") &&
                            !data.filters.receiptNumber &&
                            !data.filters.search
                            ? [
                                {
                                    clientReport: {
                                        none: {
                                            secondaryType: "DELIVERED",
                                        },
                                    },
                                    status: {
                                        notIn: ["RETURNED"],
                                    },
                                },
                                {
                                    clientReport: {
                                        none: {
                                            secondaryType: "RETURNED",
                                        },
                                    },
                                    status: {
                                        in: [
                                            "RETURNED",
                                            "REPLACED",
                                            "PARTIALLY_RETURNED",
                                        ],
                                    },
                                },
                            ]
                            : data.loggedInUser?.role === "DELIVERY_AGENT" &&
                                !data.filters.receiptNumber
                                ? [
                                    {
                                        deliveryAgentReport: { is: null },
                                        status: {
                                            notIn: ["RETURNED"],
                                        },
                                    },
                                    {
                                        deliveryAgentReport: { report: { deleted: true } },
                                        status: {
                                            notIn: ["RETURNED"],
                                        },
                                    },
                                    {
                                        secondaryStatus: "WITH_AGENT",
                                        status: {
                                            in: [
                                                "RETURNED",
                                                "REPLACED",
                                                "PARTIALLY_RETURNED",
                                            ],
                                        },
                                    },
                                ]
                                : data.loggedInUser?.role === "REPOSITORIY_EMPLOYEE" ||
                                    data.loggedInUser?.role === "BRANCH_MANAGER"
                                    ? [
                                        {
                                            branch: {
                                                id: data.loggedInUser.branchId,
                                            },
                                            status: { not: "WITH_RECEIVING_AGENT" },
                                        },
                                        {
                                            client: {
                                                branchId: data.loggedInUser?.branchId,
                                            },
                                            status: { not: "WITH_RECEIVING_AGENT" },
                                        },
                                        {
                                            status: "WITH_RECEIVING_AGENT",
                                            deliveryAgent: {
                                                branchId: data.loggedInUser.branchId,
                                            },
                                        },
                                    ]
                                    : data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                        data.loggedInUser?.role !== "CLIENT" &&
                                        data.loggedInUser?.role !== "RECEIVING_AGENT" &&
                                        data.loggedInUser?.role !== "CLIENT_ASSISTANT" &&
                                        data.loggedInUser?.role !== "INQUIRY_EMPLOYEE" &&
                                        data.loggedInUser?.role !==
                                            "EMPLOYEE_CLIENT_ASSISTANT" &&
                                        data.loggedInUser?.role !== "DELIVERY_AGENT"
                                        ? [
                                            {
                                                branch: {
                                                    id: data.loggedInUser?.branchId,
                                                },
                                            },
                                        ]
                                        : undefined,
                    },
                select: orders_responses_1.orderSelect,
                orderBy: {
                    createdAt: "desc",
                },
            }, {
                page: data.filters.page,
                size: data.filters.size,
            });
            const ordersReformed = paginatedOrders.data.map(orders_responses_1.orderReform);
            const mobileOrdersReformed = paginatedOrders.data.map(orders_responses_1.mobileOrderReform);
            const ordersMetaDataAggregate = await db_1.prisma.order.aggregate({
                where: data.loggedInUser?.role === "RECEIVING_AGENT" &&
                    data.filters.status === "RETURNED"
                    ? {
                        AND: [
                            {
                                status: {
                                    in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
                                },
                            },
                            {
                                clientReport: {
                                    some: {
                                        receivingAgentId: data.loggedInUser.id,
                                        report: {
                                            deleted: false,
                                        },
                                    },
                                },
                            },
                            {
                                client: {
                                    id: data.filters.clientID,
                                },
                            },
                        ],
                    }
                    : {
                        ...where,
                        OR: (data.loggedInUser?.role === "CLIENT" ||
                            data.loggedInUser?.role === "INQUIRY_EMPLOYEE" ||
                            data.loggedInUser?.role === "EMPLOYEE_CLIENT_ASSISTANT" ||
                            data.loggedInUser?.role === "CLIENT_ASSISTANT") &&
                            !data.filters.receiptNumber &&
                            !data.filters.search
                            ? [
                                {
                                    clientReport: {
                                        none: {
                                            secondaryType: "DELIVERED",
                                        },
                                    },
                                    status: {
                                        notIn: ["RETURNED"],
                                    },
                                },
                                {
                                    clientReport: {
                                        none: {
                                            secondaryType: "RETURNED",
                                        },
                                    },
                                    status: {
                                        in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
                                    },
                                },
                            ]
                            : data.loggedInUser?.role === "DELIVERY_AGENT"
                                ? [
                                    {
                                        deliveryAgentReport: { is: null },
                                        status: {
                                            notIn: ["RETURNED"],
                                        },
                                    },
                                    {
                                        deliveryAgentReport: { report: { deleted: true } },
                                        status: {
                                            notIn: ["RETURNED"],
                                        },
                                    },
                                    {
                                        secondaryStatus: "WITH_AGENT",
                                        status: {
                                            in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
                                        },
                                    },
                                ]
                                : data.loggedInUser?.role === "REPOSITORIY_EMPLOYEE" ||
                                    data.loggedInUser?.role === "BRANCH_MANAGER"
                                    ? [
                                        {
                                            branch: {
                                                id: data.loggedInUser.branchId,
                                            },
                                            status: { not: "WITH_RECEIVING_AGENT" },
                                        },
                                        {
                                            client: {
                                                branchId: data.loggedInUser?.branchId,
                                            },
                                            status: { not: "WITH_RECEIVING_AGENT" },
                                        },
                                        {
                                            status: "WITH_RECEIVING_AGENT",
                                            deliveryAgent: {
                                                branchId: data.loggedInUser.branchId,
                                            },
                                        },
                                    ]
                                    : data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                        data.loggedInUser?.role !== "RECEIVING_AGENT"
                                        ? [
                                            {
                                                branch: {
                                                    id: data.loggedInUser?.branchId,
                                                },
                                            },
                                        ]
                                        : undefined,
                    },
                _count: {
                    id: true,
                },
                _sum: {
                    totalCost: true,
                    paidAmount: true,
                    clientNet: true,
                    deliveryAgentNet: true,
                    companyNet: true,
                    deliveryCost: true,
                },
            });
            const ordersMetaDataGroupByStatus = await db_1.prisma.order.groupBy({
                where: where,
                by: ["status"],
                _count: {
                    status: true,
                },
            });
            const ordersMetaDataGroupByStatusReformed = Object.keys(client_1.OrderStatus).map((status) => {
                const statusCount = ordersMetaDataGroupByStatus.find((orderStatus) => {
                    return orderStatus.status === status;
                });
                return {
                    status: status,
                    count: statusCount?._count?.status || 0,
                };
            });
            const ordersMetaDataReformed = {
                count: ordersMetaDataAggregate._count.id,
                totalCost: ordersMetaDataAggregate._sum.totalCost || 0,
                paidAmount: ordersMetaDataAggregate._sum.paidAmount || 0,
                clientNet: ordersMetaDataAggregate._sum.clientNet || 0,
                deliveryAgentNet: ordersMetaDataAggregate._sum.deliveryAgentNet || 0,
                companyNet: ordersMetaDataAggregate._sum.companyNet || 0,
                deliveryCost: ordersMetaDataAggregate._sum.deliveryCost || 0,
                countByStatus: ordersMetaDataGroupByStatusReformed,
            };
            return {
                orders: data.filters.forMobile ? mobileOrdersReformed : ordersReformed,
                ordersMetaData: ordersMetaDataReformed,
                pagesCount: paginatedOrders.pagesCount,
            };
        }
        const paginatedOrders = await db_1.prisma.order.findManyPaginated({
            where: {
                ...where,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: orders_responses_1.orderSelect,
        }, {
            page: data.filters.page,
            size: data.filters.size,
        });
        const ordersReformed = paginatedOrders.data.map(orders_responses_1.orderReform);
        const ordersMetaDataAggregate = await db_1.prisma.order.aggregate({
            where: where,
            _count: {
                id: true,
            },
            _sum: {
                totalCost: true,
                paidAmount: true,
                clientNet: true,
                deliveryAgentNet: true,
                companyNet: true,
                deliveryCost: true,
            },
        });
        const ordersMetaDataGroupByStatus = await db_1.prisma.order.groupBy({
            where: where,
            by: ["status"],
            _count: {
                status: true,
            },
        });
        const ordersMetaDataGroupByStatusReformed = Object.keys(client_1.OrderStatus).map((status) => {
            const statusCount = ordersMetaDataGroupByStatus.find((orderStatus) => {
                return orderStatus.status === status;
            });
            return {
                status: status,
                count: statusCount?._count?.status || 0,
            };
        });
        const ordersMetaDataReformed = {
            count: ordersMetaDataAggregate._count.id,
            totalCost: ordersMetaDataAggregate._sum.totalCost || 0,
            paidAmount: ordersMetaDataAggregate._sum.paidAmount || 0,
            clientNet: ordersMetaDataAggregate._sum.clientNet || 0,
            deliveryAgentNet: ordersMetaDataAggregate._sum.deliveryAgentNet || 0,
            companyNet: ordersMetaDataAggregate._sum.companyNet || 0,
            deliveryCost: ordersMetaDataAggregate._sum.deliveryCost || 0,
            countByStatus: ordersMetaDataGroupByStatusReformed,
        };
        return {
            orders: ordersReformed,
            ordersMetaData: ordersMetaDataReformed,
            pagesCount: paginatedOrders.pagesCount,
        };
    }
    async getAllOrdersPaginatedApiKey(data) {
        let startDate = new Date();
        let endDate = new Date();
        if (data.filters.startDate) {
            startDate = new Date(data.filters.startDate);
            startDate.setUTCDate(startDate.getUTCDate() - 1);
            startDate.setHours(21, 0, 0, 0);
        }
        if (data.filters.endDate) {
            endDate = new Date(data.filters.endDate);
            endDate.setHours(21, 0, 0, 0);
        }
        const where = {
            AND: [
                {
                    OR: [
                        {
                            receiptNumber: data.filters.search
                                ? data.filters.search
                                : undefined,
                        },
                        {
                            branchReportId: data.filters.search
                                ? Number.isNaN(+data.filters.search)
                                    ? undefined
                                    : data.filters.search.length > 9
                                        ? undefined
                                        : +data.filters.search
                                : undefined,
                        },
                        {
                            clientReport: data.filters.search
                                ? Number.isNaN(+data.filters.search)
                                    ? undefined
                                    : data.filters.search.length > 9
                                        ? undefined
                                        : {
                                            some: {
                                                id: +data.filters.search,
                                            },
                                        }
                                : undefined,
                        },
                        {
                            repositoryReport: data.filters.search
                                ? Number.isNaN(+data.filters.search)
                                    ? undefined
                                    : data.filters.search.length > 9
                                        ? undefined
                                        : {
                                            some: {
                                                id: +data.filters.search,
                                            },
                                        }
                                : undefined,
                        },
                        {
                            companyReport: data.filters.search
                                ? Number.isNaN(+data.filters.search)
                                    ? undefined
                                    : data.filters.search.length > 9
                                        ? undefined
                                        : {
                                            some: {
                                                id: +data.filters.search,
                                            },
                                        }
                                : undefined,
                        },
                        {
                            deliveryAgentReportId: data.filters.search
                                ? Number.isNaN(+data.filters.search)
                                    ? undefined
                                    : data.filters.search.length > 9
                                        ? undefined
                                        : +data.filters.search
                                : undefined,
                        },
                        {
                            governorateReportId: data.filters.search
                                ? Number.isNaN(+data.filters.search)
                                    ? undefined
                                    : data.filters.search.length > 9
                                        ? undefined
                                        : +data.filters.search
                                : undefined,
                        },
                        {
                            recipientName: {
                                contains: data.filters.search,
                                mode: "insensitive",
                            },
                        },
                        {
                            recipientPhones: data.filters.search
                                ? {
                                    has: data.filters.search,
                                }
                                : undefined,
                        },
                        {
                            recipientAddress: {
                                contains: data.filters.search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                {
                    confirmed: data.filters.confirmed,
                },
                // Filter by orderID
                {
                    id: data.filters.orderID,
                },
                // Filter by status
                {
                    status: data.filters.statuses
                        ? { in: data.filters.statuses }
                        : undefined,
                },
                {
                    status: data.filters.status,
                },
                // Filter by deliveryType
                {
                    deliveryType: data.filters.deliveryType,
                },
                // Filter by deliveryDate
                {
                    // gte deliveryDate day start time (00:00:00) and lte deliveryDate day end time (23:59:59)
                    updatedAt: data.filters.deliveryDate
                        ? {
                            gte: new Date(new Date(data.filters.deliveryDate).setHours(0, 0, 0, 0)),
                            lte: new Date(new Date(data.filters.deliveryDate).setHours(23, 59, 59, 999)),
                        }
                        : undefined,
                },
                // Filter by clientID
                {
                    client: {
                        id: data.filters.clientID,
                    },
                },
                // Filter by storeID
                {
                    store: {
                        id: data.filters.storeID,
                    },
                },
                // Filter by locationID
                {
                    location: {
                        id: data.filters.locationID,
                    },
                },
                {
                    receiptNumber: data.filters.receiptNumber,
                },
                {
                    printed: data.filters.printed,
                },
                {
                    receiptNumber: data.filters.receiptNumbers
                        ? { in: data.filters.receiptNumbers }
                        : undefined,
                },
                // Filter by recipientName
                {
                    recipientName: data.filters.recipientName,
                },
                // Filter by recipientPhone
                {
                    recipientPhones: data.filters.recipientPhone
                        ? {
                            has: data.filters.recipientPhone,
                        }
                        : undefined,
                },
                // Filter by recipientAddress
                {
                    recipientAddress: data.filters.recipientAddress,
                },
                // Filter by notes
                {
                    notes: data.filters.notes,
                },
                // Filter by startDate
                {
                    createdAt: data.filters.startDate
                        ? {
                            gt: startDate,
                        }
                        : undefined,
                },
                // Filter by endDate
                {
                    createdAt: data.filters.endDate
                        ? {
                            lt: endDate,
                        }
                        : undefined,
                },
                // Filter by deleted
                {
                    deleted: data.filters.deleted,
                },
                // Filter by clientReport
                {
                    AND: [
                        data.filters.clientReport === "true"
                            ? {
                                clientReport: {
                                    some: {
                                        secondaryType: data.filters.delivered &&
                                            data.filters.orderType === "forwarded"
                                            ? "DELIVERED"
                                            : undefined,
                                        report: {
                                            deleted: false,
                                        },
                                    },
                                },
                            }
                            : {},
                        {
                            OR: data.filters.clientReport === "false"
                                ? [
                                    {
                                        clientReport: {
                                            none: {
                                                secondaryType: data.filters.delivered
                                                    ? "DELIVERED"
                                                    : undefined,
                                            },
                                        },
                                    },
                                    {
                                        clientReport: {
                                            some: {
                                                report: {
                                                    deleted: true,
                                                },
                                            },
                                        },
                                    },
                                ]
                                : undefined,
                        },
                    ],
                },
                {
                    governorate: data.filters.governorate,
                },
                {
                    secondaryStatus: data.filters.secondaryStatus,
                },
            ],
        };
        const paginatedOrders = await db_1.prisma.order.findManyPaginated({
            where: {
                ...where,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: orders_responses_1.orderSelectApiKey,
        }, {
            page: data.filters.page,
            size: data.filters.size,
        });
        const ordersReformed = paginatedOrders.data.map(orders_responses_1.orderReformApiKey);
        const ordersMetaDataAggregate = await db_1.prisma.order.aggregate({
            where: where,
            _count: {
                id: true,
            },
            _sum: {
                totalCost: true,
                paidAmount: true,
                clientNet: true,
                deliveryAgentNet: true,
                companyNet: true,
                deliveryCost: true,
            },
        });
        const ordersMetaDataReformed = {
            count: ordersMetaDataAggregate._count.id,
            totalCost: ordersMetaDataAggregate._sum.totalCost || 0,
            paidAmount: ordersMetaDataAggregate._sum.paidAmount || 0,
            clientNet: ordersMetaDataAggregate._sum.clientNet || 0,
        };
        return {
            orders: ordersReformed,
            ordersMetaData: ordersMetaDataReformed,
            pagesCount: paginatedOrders.pagesCount,
        };
    }
    async getOrdersByIDs(data) {
        const orders = await db_1.prisma.order.findMany({
            where: {
                id: {
                    in: data.ordersIDs,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            select: { ...orders_responses_1.orderSelect },
        });
        return orders.map(orders_responses_1.orderReform);
    }
    async getOrder(data) {
        const order = await db_1.prisma.order.findFirst({
            where: {
                receiptNumber: data.orderID,
                deleted: false,
            },
            select: orders_responses_1.orderSelect,
        });
        // const inquiryEmployees =
        //     (
        //         await prisma.employee.findMany({
        //             where: {
        //                 AND: [
        //                     { role: "INQUIRY_EMPLOYEE" },
        //                     {
        //                         OR: [
        //                             {
        //                                 inquiryBranches: order?.branch?.id
        //                                     ? {
        //                                           some: {
        //                                               branchId: order.branch.id
        //                                           }
        //                                       }
        //                                     : undefined
        //                             },
        //                             {
        //                                 inquiryStores: order?.store.id
        //                                     ? {
        //                                           some: {
        //                                               storeId: order.store.id
        //                                           }
        //                                       }
        //                                     : undefined
        //                             },
        //                             {
        //                                 inquiryCompanies: order?.company.id
        //                                     ? {
        //                                           some: {
        //                                               companyId: order.company.id
        //                                           }
        //                                       }
        //                                     : undefined
        //                             },
        //                             {
        //                                 inquiryLocations: order?.location?.id
        //                                     ? {
        //                                           some: {
        //                                               locationId: order.location.id
        //                                           }
        //                                       }
        //                                     : undefined
        //                             }
        //                         ]
        //                     }
        //                 ]
        //             },
        //             select: {
        //                 user: {
        //                     select: {
        //                         id: true,
        //                         name: true,
        //                         phone: true,
        //                         avatar: true
        //                     }
        //                 },
        //                 role: true
        //             }
        //         })
        //     ).map((inquiryEmployee) => {
        //         return {
        //             id: inquiryEmployee.user?.id ?? null,
        //             name: inquiryEmployee.user?.name ?? null,
        //             phone: inquiryEmployee.user?.phone ?? null,
        //             avatar: inquiryEmployee.user?.avatar ?? null,
        //             role: inquiryEmployee.role
        //         };
        //     }) ?? [];
        const reformedOrder = (0, orders_responses_1.orderReform)(order);
        return reformedOrder;
        // return {
        //     ...reformedOrder,
        //     inquiryEmployees: [...(reformedOrder?.inquiryEmployees || []), ...inquiryEmployees]
        // };
    }
    async getOrderById(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
                deleted: false,
            },
            select: orders_responses_1.orderSelect,
        });
        const reformedOrder = (0, orders_responses_1.orderReform)(order);
        return reformedOrder;
    }
    async getOrderByIdApiKey(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
                deleted: false,
            },
            select: orders_responses_1.orderSelectApiKey,
        });
        const reformedOrder = (0, orders_responses_1.orderReformApiKey)(order);
        return reformedOrder;
    }
    async getOrderByReceiptNumber(data) {
        const order = await db_1.prisma.order.findFirst({
            where: {
                receiptNumber: data.orderReceiptNumber,
                deleted: false,
            },
            orderBy: {
                id: "desc",
            },
            select: orders_responses_1.orderSelect,
        });
        return (0, orders_responses_1.orderReform)(order);
    }
    async updateOrdersCosts(data) {
        if (data.costs.reportType === client_1.ReportType.CLIENT) {
            // Get Baghdad orders
            const baghdadOrders = await db_1.prisma.order.findMany({
                where: {
                    id: {
                        in: data.ordersIDs,
                    },
                    governorate: client_1.Governorate.BAGHDAD,
                },
                select: {
                    id: true,
                    paidAmount: true,
                    weight: true,
                    deliveryCost: true,
                    company: {
                        select: {
                            additionalPriceForEvery500000IraqiDinar: true,
                            additionalPriceForEveryKilogram: true,
                            additionalPriceForRemoteAreas: true,
                        },
                    },
                },
            });
            // Update Baghdad orders costs
            for (const order of baghdadOrders) {
                // const weight = order.weight || 0;
                const deliveryCost = data.costs.baghdadDeliveryCost || order.deliveryCost;
                // let weightedDeliveryCost =
                //   deliveryCost +
                //   weight * order.company?.additionalPriceForEveryKilogram;
                // weightedDeliveryCost += order.company
                //   ?.additionalPriceForEvery500000IraqiDinar
                //   ? order.company?.additionalPriceForEvery500000IraqiDinar *
                //     Math.ceil(order.paidAmount / 500000)
                //   : 0;
                const clientNet = (order.paidAmount || 0) - deliveryCost;
                await db_1.prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        deliveryCost: deliveryCost,
                        clientNet: clientNet,
                    },
                });
            }
        }
        if (data.costs.reportType === client_1.ReportType.CLIENT) {
            // get governorates orders
            const governoratesOrders = await db_1.prisma.order.findMany({
                where: {
                    id: {
                        in: data.ordersIDs,
                    },
                    governorate: {
                        not: client_1.Governorate.BAGHDAD,
                    },
                },
                select: {
                    id: true,
                    paidAmount: true,
                    deliveryCost: true,
                    weight: true,
                    company: {
                        select: {
                            additionalPriceForEvery500000IraqiDinar: true,
                            additionalPriceForEveryKilogram: true,
                            additionalPriceForRemoteAreas: true,
                        },
                    },
                },
            });
            // Update governorates orders costs
            for (const order of governoratesOrders) {
                // const weight = order.weight || 0;
                const deliveryCost = data.costs.governoratesDeliveryCost || order.deliveryCost;
                // let weightedDeliveryCost =
                //   deliveryCost +
                //   weight * order.company?.additionalPriceForEveryKilogram;
                // weightedDeliveryCost += order.company
                //   ?.additionalPriceForEvery500000IraqiDinar
                //   ? order.company?.additionalPriceForEvery500000IraqiDinar *
                //     Math.ceil(order.paidAmount / 500000)
                //   : 0;
                const clientNet = (order.paidAmount || 0) - deliveryCost;
                await db_1.prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        deliveryCost: deliveryCost,
                        clientNet: clientNet,
                    },
                });
            }
        }
        if (data.costs.baghdadDeliveryCost &&
            data.costs.reportType === client_1.ReportType.BRANCH) {
            // Get Baghdad orders
            const baghdadOrders = await db_1.prisma.order.findMany({
                where: {
                    id: {
                        in: data.ordersIDs,
                    },
                    governorate: client_1.Governorate.BAGHDAD,
                },
                select: {
                    id: true,
                    paidAmount: true,
                    weight: true,
                },
            });
            // Update Baghdad orders costs
            for (const order of baghdadOrders) {
                await db_1.prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        branchNet: order.paidAmount - data.costs.baghdadDeliveryCost,
                    },
                });
            }
        }
        if (data.costs.governoratesDeliveryCost &&
            data.costs.reportType === client_1.ReportType.BRANCH) {
            // get governorates orders
            const governoratesOrders = await db_1.prisma.order.findMany({
                where: {
                    id: {
                        in: data.ordersIDs,
                    },
                    governorate: {
                        not: client_1.Governorate.BAGHDAD,
                    },
                },
                select: {
                    id: true,
                    paidAmount: true,
                    weight: true,
                },
            });
            // Update governorates orders costs
            for (const order of governoratesOrders) {
                await db_1.prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        branchNet: order.paidAmount - data.costs.governoratesDeliveryCost,
                    },
                });
            }
        }
        if (!data.costs.baghdadDeliveryCost &&
            !data.costs.governoratesDeliveryCost &&
            data.costs.reportType === client_1.ReportType.BRANCH) {
            // Get Baghdad orders
            const orders = await db_1.prisma.order.findMany({
                where: {
                    id: {
                        in: data.ordersIDs,
                    },
                },
                select: {
                    id: true,
                    paidAmount: true,
                    governorate: true,
                    weight: true,
                    client: {
                        select: {
                            governoratesDeliveryCosts: true,
                        },
                    },
                },
            });
            // Update Baghdad orders costs
            for (const order of orders) {
                const governoratesDeliveryCosts = order.client
                    .governoratesDeliveryCosts;
                let deliveryCost = 0;
                if (governoratesDeliveryCosts) {
                    deliveryCost =
                        governoratesDeliveryCosts.find((governorateDeliveryCost) => {
                            return (governorateDeliveryCost.governorate === order.governorate);
                        })?.cost || 0;
                }
                await db_1.prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        branchNet: order.paidAmount - deliveryCost,
                        branchDeliveryCost: deliveryCost,
                    },
                });
            }
        }
        // Update delivery agent delivery cost
        if (data.costs.deliveryAgentDeliveryCost) {
            // get orders
            const orders = await db_1.prisma.order.findMany({
                where: {
                    id: {
                        in: data.ordersIDs,
                    },
                },
                select: {
                    id: true,
                    paidAmount: true,
                    weight: true,
                },
            });
            // Update orders costs
            for (const order of orders) {
                const weight = order.weight || 0;
                const deliveryAgentNet = data.costs.deliveryAgentDeliveryCost + weight * 250;
                const companyNet = (order.paidAmount || 0) - deliveryAgentNet;
                await db_1.prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        deliveryAgentNet: deliveryAgentNet,
                        companyNet: companyNet,
                    },
                });
            }
        }
    }
    async updateOrder(data) {
        const orderData = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
            },
            select: {
                deliveryCost: true,
                oldDeliveryCost: true,
                clientNet: true,
                companyNet: true,
                deliveryAgentNet: true,
                clientId: true,
                paidAmount: true,
                weight: true,
                receivedAt: true,
                deliveryAgent: {
                    select: {
                        deliveryCost: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        // Calculate order costs
        let deliveryAgentCost = orderData?.deliveryAgentNet;
        let companyNet = orderData?.companyNet;
        let clientNet = orderData?.clientNet;
        let newDeliveryCost = orderData?.deliveryCost
            ? orderData?.deliveryCost
            : orderData?.oldDeliveryCost;
        let oldDeliveryCost = orderData?.deliveryCost
            ? orderData?.deliveryCost
            : orderData?.oldDeliveryCost;
        let weight = data.orderData.weight || orderData?.weight || 0;
        if (data.orderData.governorate) {
            newDeliveryCost = await this.getDeliverCost(orderData?.clientId, data.orderData.governorate);
        }
        if (weight) {
            const companyAdditionalPrices = await db_1.prisma.company.findUnique({
                where: {
                    id: orderData?.company?.id,
                },
                select: {
                    additionalPriceForEveryKilogram: true,
                },
            });
            const oldWeight = orderData?.weight;
            if (weight > oldWeight) {
                newDeliveryCost = (orderData?.deliveryCost || 0);
                newDeliveryCost +=
                    companyAdditionalPrices?.additionalPriceForEveryKilogram
                        ? (weight - oldWeight) *
                            companyAdditionalPrices.additionalPriceForEveryKilogram
                        : 0;
            }
            else if (weight < oldWeight) {
                newDeliveryCost = (orderData?.deliveryCost || 0);
                newDeliveryCost -=
                    companyAdditionalPrices?.additionalPriceForEveryKilogram
                        ? (oldWeight - weight) *
                            companyAdditionalPrices.additionalPriceForEveryKilogram
                        : 0;
            }
        }
        if (data.orderData.paidAmount) {
            // calculate client net
            const deliveryCost = newDeliveryCost
                ? newDeliveryCost
                : (orderData?.deliveryCost || 0);
            clientNet = data.orderData.paidAmount - deliveryCost;
            // calculate company net
            if (data.orderData.deliveryAgentID) {
                const orderDeliveryAgent = await db_1.prisma.employee.findUnique({
                    where: {
                        id: data.orderData.deliveryAgentID,
                    },
                    select: {
                        deliveryCost: true,
                    },
                });
                deliveryAgentCost = orderDeliveryAgent?.deliveryCost
                    ? Number(orderDeliveryAgent?.deliveryCost)
                    : 0;
                deliveryAgentCost += weight * 250;
                companyNet = data.orderData.paidAmount - deliveryAgentCost;
            }
            else if (orderData?.deliveryAgent) {
                deliveryAgentCost = orderData?.deliveryAgent?.deliveryCost
                    ? Number(orderData?.deliveryAgent?.deliveryCost)
                    : 0;
                deliveryAgentCost += weight * 250;
                companyNet = data.orderData.paidAmount - deliveryAgentCost;
            }
        }
        else {
            const deliveryCost = newDeliveryCost
                ? newDeliveryCost
                : (orderData?.deliveryCost || 0);
            clientNet = orderData
                ? +orderData?.paidAmount - deliveryCost
                : -deliveryCost;
        }
        if (data.orderData.status === "RETURNED") {
            newDeliveryCost = 0;
            clientNet = 0;
        }
        const order = await db_1.prisma.order.update({
            where: {
                id: data.orderID,
            },
            data: {
                quantity: data.orderData.quantity,
                totalCost: data.orderData.totalCost,
                paidAmount: data.orderData.paidAmount,
                receiptNumber: data.orderData.receiptNumber,
                processingStatus: data.orderData.processingStatus,
                governorate: data.orderData.governorate
                    ? data.orderData.governorate
                    : undefined,
                location: data.orderData.locationID
                    ? {
                        connect: {
                            id: data.orderData.locationID,
                        },
                    }
                    : undefined,
                clientNet: clientNet,
                deliveryCost: newDeliveryCost,
                oldDeliveryCost: oldDeliveryCost,
                deliveryAgentNet: deliveryAgentCost,
                weight: weight,
                companyNet: companyNet,
                discount: data.orderData.discount,
                recipientName: data.orderData.recipientName,
                recipientPhones: data.orderData.recipientPhones
                    ? data.orderData.recipientPhones
                    : data.orderData.recipientPhone
                        ? [data.orderData.recipientPhone]
                        : undefined,
                recipientAddress: data.orderData.recipientAddress,
                notes: data.orderData.notes,
                currentLocation: data.orderData.currentLocation,
                status: data.orderData.status,
                secondaryStatus: data.orderData.status === "DELIVERED"
                    ? null
                    : data.orderData.secondaryStatus,
                confirmed: data.orderData.forwardedCompanyID
                    ? false
                    : data.orderData.confirmed,
                details: data.orderData.details,
                receivedAt: data.orderData.confirmed && !orderData?.receivedAt
                    ? new Date()
                    : undefined,
                deliveryDate: data.orderData.deliveryAgentID
                    ? new Date()
                    : data.orderData.deliveryDate,
                forwardedToMainRepo: data.orderData.status === "IN_MAIN_REPOSITORY"
                    ? false
                    : data.orderData.forwardedToMainRepo,
                forwardedToGov: data.orderData.forwardedToGov,
                forwardedBranchId: data.orderData.forwardedBranchId === -1
                    ? null
                    : data.orderData.forwardedBranchId,
                receivedBranchId: data.orderData.receivedBranchId === -1
                    ? null
                    : data.orderData.receivedBranchId,
                forwardedRepo: data.orderData.secondaryStatus === "IN_REPOSITORY"
                    ? null
                    : data.orderData.forwardedRepo,
                company: {
                    connect: {
                        id: data.orderData.forwardedCompanyID
                            ? data.orderData.forwardedCompanyID
                            : data.loggedInUser.companyID,
                    },
                },
                forwarded: data.orderData.forwardedCompanyID ? true : undefined,
                forwardedBy: data.orderData.forwardedCompanyID
                    ? {
                        connect: {
                            id: data.loggedInUser.id,
                        },
                    }
                    : undefined,
                forwardedAt: data.orderData.forwardedCompanyID ? new Date() : undefined,
                forwardedFrom: data.orderData.forwardedCompanyID
                    ? {
                        connect: {
                            id: data.loggedInUser.companyID,
                        },
                    }
                    : undefined,
                processed: data.orderData.processed,
                processedAt: data.orderData.processed ? new Date() : undefined,
                processedBy: data.orderData.processed
                    ? { connect: { id: data.loggedInUser.id } }
                    : undefined,
                deliveryAgent: 
                // unlink delivery agent if null
                data.orderData.deliveryAgentID === null
                    ? {
                        disconnect: true,
                    }
                    : data.orderData.deliveryAgentID !== undefined
                        ? {
                            connect: {
                                id: data.orderData.deliveryAgentID,
                            },
                        }
                        : undefined,
                repository: data.orderData.repositoryID
                    ? {
                        connect: {
                            id: data.orderData.repositoryID,
                        },
                    }
                    : undefined,
                branch: data.orderData.branchID
                    ? {
                        connect: {
                            id: data.orderData.branchID,
                        },
                    }
                    : undefined,
                client: data.orderData.clientID
                    ? {
                        connect: {
                            id: data.orderData.clientID,
                        },
                    }
                    : undefined,
                store: data.orderData.storeID
                    ? {
                        connect: {
                            id: data.orderData.storeID,
                        },
                    }
                    : undefined,
                ordersInquiryEmployees: data.orderData.inquiryEmployeesIDs
                    ? {
                        deleteMany: {
                            orderId: data.orderID,
                        },
                        create: data.orderData.inquiryEmployeesIDs?.map((id) => {
                            return {
                                inquiryEmployee: {
                                    connect: {
                                        id: id,
                                    },
                                },
                            };
                        }),
                    }
                    : undefined,
            },
            select: orders_responses_1.orderSelect,
        });
        let chatMembers = await messageController.getOrderChatMembers(order.id);
        // const initialMessages=await this.getChatMessages(orderId,userId)
        chatMembers.forEach((member) => {
            server_1.io.to(`${member}`).emit("newUpdate", { id: order.id });
        });
        const RECEIVING_AGENT = await db_1.prisma.employee.findMany({
            where: {
                role: "RECEIVING_AGENT",
                inquiryClients: {
                    some: {
                        clientId: order.client.user.id,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        RECEIVING_AGENT.map((e) => {
            server_1.io.to(`${e.id}`).emit("newUpdate", { id: order.id });
        });
        return (0, orders_responses_1.orderReform)(order);
    }
    async deleteOrder(data) {
        const deletedOrder = await db_1.prisma.order.delete({
            where: {
                id: data.orderID,
            },
        });
        return deletedOrder;
    }
    async deactivateOrder(data) {
        const deletedOrder = await db_1.prisma.order.update({
            where: {
                id: data.orderID,
            },
            data: {
                deleted: true,
                deletedAt: new Date(),
                deletedBy: {
                    connect: {
                        id: data.deletedByID,
                    },
                },
            },
        });
        return deletedOrder;
    }
    async reactivateOrder(data) {
        const deletedOrder = await db_1.prisma.order.update({
            where: {
                id: data.orderID,
            },
            data: {
                deleted: false,
            },
        });
        return deletedOrder;
    }
    async getOrdersStatistics(data) {
        const filtersReformed = data.loggedInUser.role === "INQUIRY_EMPLOYEE"
            ? {
                AND: [
                    {
                        status: data.filters.inquiryStatuses
                            ? {
                                in: data.filters.inquiryStatuses,
                            }
                            : undefined,
                    },
                    {
                        deleted: false,
                    },
                    {
                        governorate: data.filters.inquiryGovernorates
                            ? {
                                in: data.filters.inquiryGovernorates,
                            }
                            : undefined,
                    },
                    {
                        branch: data.filters.orderType
                            ? undefined
                            : data.filters.inquiryBranchesIDs
                                ? {
                                    id: {
                                        in: data.filters.inquiryBranchesIDs,
                                    },
                                }
                                : data.loggedInUser.mainRepository
                                    ? undefined
                                    : {
                                        id: data.loggedInUser.branchId,
                                    },
                    },
                    {
                        deliveryAgent: data.filters.inquiryDeliveryAgentsIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryDeliveryAgentsIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        store: data.filters.inquiryStoresIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryStoresIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        company: {
                            id: data.filters.companyID,
                        },
                    },
                    {
                        location: data.filters.inquiryLocationsIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryLocationsIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        forwardedBranchId: data.filters.orderType === "forwarded" &&
                            data.filters.inquiryBranchesIDs
                            ? { in: data.filters.inquiryBranchesIDs }
                            : data.filters.orderType === "forwarded"
                                ? { not: null }
                                : undefined,
                    },
                    {
                        receivedBranchId: data.filters.orderType === "receiving" &&
                            data.filters.inquiryBranchesIDs
                            ? { in: data.filters.inquiryBranchesIDs }
                            : data.filters.orderType === "receiving"
                                ? { not: null }
                                : undefined,
                    },
                ],
            }
            : {
                AND: [
                    {
                        OR: [
                            {
                                company: {
                                    id: data.filters.companyID,
                                },
                            },
                            {
                                forwardedFrom: {
                                    id: data.filters.inquiryCompaniesIDs
                                        ? {
                                            in: [
                                                ...data.filters.inquiryCompaniesIDs,
                                                //   data.filters.companyID as number
                                            ],
                                        }
                                        : data.filters.companyID,
                                },
                            },
                        ],
                    },
                    {
                        branch: data.filters.inquiryBranchesIDs
                            ? {
                                id: {
                                    in: data.filters.inquiryBranchesIDs,
                                },
                            }
                            : undefined,
                    },
                    {
                        storeId: data.loggedInUser.role === "CLIENT_ASSISTANT" ||
                            data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT"
                            ? { in: data.filters.inquiryStoresIDs }
                            : data.filters.storeID,
                    },
                    {
                        governorateReport: data.filters.governorateReport
                            ? { isNot: null }
                            : data.filters.governorateReport
                                ? { is: null }
                                : undefined,
                    },
                    {
                        deliveryAgentReport: data.filters.deliveryAgentReport
                            ? { isNot: null }
                            : data.filters.deliveryAgentReport
                                ? { is: null }
                                : undefined,
                    },
                    {
                        governorate: data.filters.governorate,
                    },
                    {
                        createdAt: {
                            gte: data.filters.startDate,
                        },
                    },
                    {
                        createdAt: {
                            lte: data.filters.endDate,
                        },
                    },
                    {
                        client: {
                            id: data.filters.inquiryClientsIDs
                                ? {
                                    in: [
                                        ...data.filters.inquiryClientsIDs,
                                        //   data.filters.companyID as number
                                    ],
                                }
                                : data.filters.clientID,
                        },
                    },
                    {
                        deliveryType: data.filters.deliveryType,
                    },
                    {
                        location: {
                            id: data.filters.locationID,
                        },
                    },
                    {
                        deliveryAgent: {
                            id: data.filters.deliveryAgentID,
                        },
                    },
                    {
                        deleted: false,
                    },
                    {
                        forwardedBranchId: data.filters.orderType === "forwardedAll" &&
                            (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                data.loggedInUser?.mainRepository) &&
                            data.filters.branchID
                            ? data.filters.branchID
                            : data.filters.orderType === "forwardedAll" &&
                                (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                    data.loggedInUser?.mainRepository)
                                ? {
                                    not: null,
                                }
                                : data.filters.orderType === "forwardedAll"
                                    ? data.loggedInUser?.branchId
                                    : data.filters.orderType === "receivedAll" &&
                                        data.filters.branchID &&
                                        data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                        !data.loggedInUser?.mainCompany
                                        ? data.filters.branchID
                                        : undefined,
                    },
                    {
                        receivedBranchId: data.filters.orderType === "receivedAll" &&
                            (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                data.loggedInUser?.mainRepository) &&
                            data.filters.branchID
                            ? data.filters.branchID
                            : data.filters.orderType === "receivedAll" &&
                                (data.loggedInUser?.role === "COMPANY_MANAGER" ||
                                    data.loggedInUser?.mainRepository)
                                ? {
                                    not: null,
                                }
                                : data.filters.orderType === "forwardedAll" &&
                                    data.filters.branchID &&
                                    data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                    !data.loggedInUser?.mainCompany
                                    ? data.filters.branchID
                                    : data.filters.orderType === "receivedAll"
                                        ? data.loggedInUser?.branchId
                                        : undefined,
                    },
                ],
            };
        const ordersStatisticsByStatus = await db_1.prisma.order.groupBy({
            by: ["status"],
            _sum: {
                totalCost: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...filtersReformed,
                OR: data.loggedInUser.role === "CLIENT" ||
                    data.loggedInUser.role === "INQUIRY_EMPLOYEE" ||
                    data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT" ||
                    data.loggedInUser.role === "CLIENT_ASSISTANT"
                    ? [
                        {
                            clientReport: {
                                none: {
                                    secondaryType: "DELIVERED",
                                },
                            },
                            status: {
                                notIn: ["RETURNED"],
                            },
                        },
                        {
                            clientReport: {
                                none: {
                                    secondaryType: "RETURNED",
                                },
                            },
                            status: {
                                in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
                            },
                        },
                    ]
                    : data.loggedInUser.role === "DELIVERY_AGENT"
                        ? [
                            {
                                deliveryAgentReport: { is: null },
                                status: {
                                    notIn: ["RETURNED"],
                                },
                            },
                            {
                                deliveryAgentReport: { report: { deleted: true } },
                                status: {
                                    notIn: ["RETURNED"],
                                },
                            },
                            {
                                secondaryStatus: "WITH_AGENT",
                                status: {
                                    in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
                                },
                            },
                        ]
                        : data.loggedInUser.role === "REPOSITORIY_EMPLOYEE" ||
                            data.loggedInUser.role === "BRANCH_MANAGER"
                            ? [
                                {
                                    branch: {
                                        id: data.loggedInUser.branchId,
                                    },
                                    status: { not: "WITH_RECEIVING_AGENT" },
                                },
                                {
                                    client: {
                                        branchId: data.loggedInUser?.branchId,
                                    },
                                    status: { not: "WITH_RECEIVING_AGENT" },
                                },
                                {
                                    status: "WITH_RECEIVING_AGENT",
                                    deliveryAgent: {
                                        branchId: data.loggedInUser.branchId,
                                    },
                                },
                            ]
                            : data.loggedInUser?.role !== "COMPANY_MANAGER" &&
                                data.loggedInUser?.role !== "RECEIVING_AGENT"
                                ? [
                                    {
                                        branch: {
                                            id: data.loggedInUser?.branchId,
                                        },
                                    },
                                ]
                                : undefined,
            },
        });
        const ordersStatisticsByGovernorate = await db_1.prisma.order.groupBy({
            by: ["governorate"],
            _sum: {
                totalCost: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...filtersReformed,
            },
        });
        const allOrdersStatistics = await db_1.prisma.order.aggregate({
            _sum: {
                totalCost: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...filtersReformed,
            },
        });
        const allOrdersStatisticsWithoutClientReport = await db_1.prisma.order.aggregate({
            _sum: {
                paidAmount: true,
                deliveryCost: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...filtersReformed,
                OR: [
                    {
                        clientReport: {
                            none: {
                                secondaryType: "DELIVERED",
                            },
                        },
                        status: {
                            in: ["DELIVERED", "REPLACED", "PARTIALLY_RETURNED"],
                        },
                    },
                ],
                status: {
                    in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"],
                },
            },
        });
        const allOrdersStatisticsWithoutDeliveryReport = await db_1.prisma.order.aggregate({
            _sum: {
                paidAmount: true,
                deliveryAgentNet: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...filtersReformed,
                OR: [
                    { deliveryAgentReport: { is: null } },
                    { deliveryAgentReport: { report: { deleted: true } } },
                ],
                status: {
                    in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"],
                },
            },
        });
        const allOrdersStatisticsWithoutCompanyReport = await db_1.prisma.order.aggregate({
            _sum: {
                paidAmount: true,
            },
            _count: {
                id: true,
            },
            where: {
                ...filtersReformed,
                OR: [
                    {
                        companyReport: {
                            none: {
                                secondaryType: "DELIVERED",
                            },
                        },
                        status: {
                            in: ["DELIVERED", "REPLACED", "PARTIALLY_RETURNED"],
                        },
                    },
                ],
                status: {
                    in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"],
                },
            },
        });
        const todayOrdersStatistics = await db_1.prisma.order.aggregate({
            _sum: { totalCost: true },
            _count: { id: true },
            where: {
                ...filtersReformed,
                deleted: false,
                deliveryDate: data.loggedInUser.role === "DELIVERY_AGENT"
                    ? { gte: new Date(Date.now() - 22 * 60 * 60 * 1000) }
                    : undefined,
                receivedAt: data.loggedInUser.role !== "DELIVERY_AGENT"
                    ? { gte: new Date(Date.now() - 22 * 60 * 60 * 1000) }
                    : undefined,
            },
        });
        return (0, orders_responses_1.statisticsReformed)({
            ordersStatisticsByStatus,
            ordersStatisticsByGovernorate,
            allOrdersStatistics,
            allOrdersStatisticsWithoutClientReport,
            todayOrdersStatistics,
            allOrdersStatisticsWithoutDeliveryReport,
            allOrdersStatisticsWithoutBranchReport: allOrdersStatisticsWithoutCompanyReport,
            allOrdersStatisticsWithoutCompanyReport,
        });
    }
    async getOrderTimeline(data) {
        const orderTimeline = await db_1.prisma.orderTimeline.findMany({
            where: {
                order: {
                    id: data.params.orderID,
                },
                type: data.filters.types ? { in: data.filters.types } : data.filters.type,
            },
            select: orders_responses_1.orderTimelineSelect,
            orderBy: {
                createdAt: "asc",
            },
        });
        return orderTimeline.map(orders_responses_1.orderTimelineReform);
    }
    async getOrderTimelineApiKey(data) {
        const orderTimeline = await db_1.prisma.orderTimeline.findMany({
            where: {
                order: {
                    id: data.params.orderID,
                },
            },
            select: orders_responses_1.orderTimelineSelect,
            orderBy: {
                createdAt: "asc",
            },
        });
        return orderTimeline.map(orders_responses_1.orderTimelineReform);
    }
    async updateOrderTimeline(data) {
        await db_1.prisma.orderTimeline.create({
            data: {
                order: {
                    connect: {
                        id: data.orderID,
                    },
                },
                type: data.data.type,
                by: data.data.by,
                old: JSON.stringify(data.data.old),
                new: JSON.stringify(data.data.new),
                message: data.data.message,
                createdAt: data.data.date,
            },
        });
    }
    async getOrderChatMembers(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
            },
            select: {
                id: true,
                status: true,
                governorate: true,
                branchId: true,
                storeId: true,
                companyId: true,
                locationId: true,
                client: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                avatar: true,
                            },
                        },
                    },
                },
                deliveryAgent: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                avatar: true,
                            },
                        },
                    },
                },
                ordersInquiryEmployees: {
                    select: {
                        inquiryEmployee: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        phone: true,
                                        avatar: true,
                                    },
                                },
                                role: true,
                            },
                        },
                    },
                },
            },
        });
        const inquiryEmployees = await this.getOrderInquiryEmployees({
            orderID: order?.id,
        });
        // array of chat members with no nulls
        if (!order) {
            throw new AppError_1.AppError("الطلب غير موجود", 404);
        }
        const chatMembers = [
            order?.client && {
                id: order?.client?.user?.id,
                name: order?.client?.user?.name,
                phone: order?.client?.user?.phone,
                avatar: order?.client?.user?.avatar,
                role: order?.client?.role,
            },
            order?.deliveryAgent && {
                id: order?.deliveryAgent?.user?.id,
                name: order?.deliveryAgent?.user?.name,
                phone: order?.deliveryAgent?.user?.phone,
                avatar: order?.deliveryAgent?.user?.avatar,
                role: order?.deliveryAgent?.role,
            },
            ...(order?.ordersInquiryEmployees?.map((orderInquiryEmployee) => {
                return {
                    id: orderInquiryEmployee.inquiryEmployee.user?.id ?? null,
                    name: orderInquiryEmployee.inquiryEmployee.user?.name ?? null,
                    phone: orderInquiryEmployee.inquiryEmployee?.user?.phone ?? null,
                    avatar: orderInquiryEmployee.inquiryEmployee.user?.avatar ?? null,
                    role: orderInquiryEmployee.inquiryEmployee.role,
                };
            }) ?? []),
            ...(inquiryEmployees ?? []),
        ].filter((chatMember) => {
            return chatMember !== null;
        });
        return chatMembers;
    }
    async getOrderInquiryEmployees(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
            },
            select: {
                branchId: true,
                storeId: true,
                companyId: true,
                locationId: true,
                status: true,
                governorate: true,
                client: {
                    select: {
                        branchId: true,
                    },
                },
                deliveryAgent: {
                    select: {
                        id: true,
                    },
                },
                location: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!order) {
            throw new AppError_1.AppError("الطلب غير موجود", 404);
        }
        const orderInquiryEmployees = [];
        (await db_1.prisma.employee.findMany({
            where: {
                AND: [
                    { deleted: false },
                    { role: "INQUIRY_EMPLOYEE" },
                    {
                        OR: [
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.client.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: "receiving",
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: "forwarded",
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.client.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    none: {},
                                },
                            },
                        ],
                    },
                    {
                        mainEmergency: false,
                    },
                ],
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
                inquiryStatuses: true,
                inquiryGovernorates: true,
                inquiryLocations: true,
                inquiryStores: true,
                inquiryDeliveryAgents: true,
                role: true,
            },
        })).forEach((inquiryEmployee) => {
            const inquiryLocation = inquiryEmployee.inquiryLocations.find((e) => e.locationId === order.locationId);
            const inquiryStore = inquiryEmployee.inquiryStores.find((e) => e.storeId === order.storeId);
            const inquiryDelivery = inquiryEmployee.inquiryDeliveryAgents.find((e) => e.deliveryAgentId === order.deliveryAgent?.id);
            if (inquiryEmployee.inquiryStatuses.length > 0 &&
                !inquiryEmployee.inquiryStatuses.includes(order?.status)) {
                return;
            }
            if (inquiryEmployee.inquiryGovernorates.length > 0 &&
                !inquiryEmployee.inquiryGovernorates.includes(order?.governorate)) {
                return;
            }
            if (inquiryEmployee.inquiryStores.length > 0 && !inquiryStore) {
                return;
            }
            if (inquiryEmployee.inquiryLocations.length > 0 && !inquiryLocation) {
                return;
            }
            if (inquiryEmployee.inquiryDeliveryAgents.length > 0 &&
                order.deliveryAgent &&
                !inquiryDelivery) {
                return;
            }
            orderInquiryEmployees.push({
                id: inquiryEmployee.user?.id ?? null,
                name: inquiryEmployee.user?.name ?? null,
                phone: inquiryEmployee.user?.phone ?? null,
                avatar: inquiryEmployee.user?.avatar ?? null,
                role: inquiryEmployee.role,
            });
            // return {
            //   id: inquiryEmployee.user?.id ?? null,
            //   name: inquiryEmployee.user?.name ?? null,
            //   phone: inquiryEmployee.user?.phone ?? null,
            //   avatar: inquiryEmployee.user?.avatar ?? null,
            //   role: inquiryEmployee.role,
            // };
        }) ?? [];
        return orderInquiryEmployees;
    }
    async getOrderInquiryEmployeesForNotifications(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
            },
            select: {
                branchId: true,
                storeId: true,
                companyId: true,
                locationId: true,
                status: true,
                governorate: true,
                client: {
                    select: {
                        branchId: true,
                    },
                },
                deliveryAgent: {
                    select: {
                        id: true,
                    },
                },
                location: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!order) {
            throw new AppError_1.AppError("الطلب غير موجود", 404);
        }
        const orderInquiryEmployees = [];
        (await db_1.prisma.employee.findMany({
            where: {
                AND: [
                    { deleted: false },
                    { role: "INQUIRY_EMPLOYEE" },
                    {
                        OR: [
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.client.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: "receiving",
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: "forwarded",
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.client.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    none: {},
                                },
                            },
                        ],
                    },
                ],
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
                inquiryStatuses: true,
                inquiryGovernorates: true,
                inquiryLocations: true,
                inquiryStores: true,
                inquiryDeliveryAgents: true,
                role: true,
            },
        })).forEach((inquiryEmployee) => {
            const inquiryLocation = inquiryEmployee.inquiryLocations.find((e) => e.locationId === order.locationId);
            const inquiryStore = inquiryEmployee.inquiryStores.find((e) => e.storeId === order.storeId);
            const inquiryDelivery = inquiryEmployee.inquiryDeliveryAgents.find((e) => e.deliveryAgentId === order.deliveryAgent?.id);
            if (inquiryEmployee.inquiryStatuses.length > 0 &&
                !inquiryEmployee.inquiryStatuses.includes(order?.status)) {
                return;
            }
            if (inquiryEmployee.inquiryGovernorates.length > 0 &&
                !inquiryEmployee.inquiryGovernorates.includes(order?.governorate)) {
                return;
            }
            if (inquiryEmployee.inquiryStores.length > 0 && !inquiryStore) {
                return;
            }
            if (inquiryEmployee.inquiryLocations.length > 0 && !inquiryLocation) {
                return;
            }
            if (inquiryEmployee.inquiryDeliveryAgents.length > 0 &&
                order.deliveryAgent &&
                !inquiryDelivery) {
                return;
            }
            orderInquiryEmployees.push({
                id: inquiryEmployee.user?.id ?? null,
                name: inquiryEmployee.user?.name ?? null,
                phone: inquiryEmployee.user?.phone ?? null,
                avatar: inquiryEmployee.user?.avatar ?? null,
                role: inquiryEmployee.role,
            });
            // return {
            //   id: inquiryEmployee.user?.id ?? null,
            //   name: inquiryEmployee.user?.name ?? null,
            //   phone: inquiryEmployee.user?.phone ?? null,
            //   avatar: inquiryEmployee.user?.avatar ?? null,
            //   role: inquiryEmployee.role,
            // };
        }) ?? [];
        return orderInquiryEmployees;
    }
    async getOrderStatus(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
            },
            select: {
                status: true,
            },
        });
        return order;
    }
    async updateOrdersSecondaryStatus(data) {
        const updatedOrders = await db_1.prisma.order.updateMany({
            where: {
                id: {
                    in: data.ordersIDs,
                },
            },
            data: {
                secondaryStatus: data.secondaryStatus,
            },
        });
        return updatedOrders;
    }
    async removeOrderFromRepositoryReport(data) {
        await db_1.prisma.$transaction([
            db_1.prisma.order.update({
                where: {
                    id: data.orderID,
                },
                data: {
                    repositoryReport: data.repositoryReportID
                        ? {
                            disconnect: {
                                id: data.repositoryReportID,
                            },
                        }
                        : undefined,
                },
            }),
            db_1.prisma.report.update({
                where: {
                    id: data.repositoryReportID,
                },
                data: {
                    baghdadOrdersCount: {
                        decrement: data.orderData.governorate === client_1.Governorate.BAGHDAD ? 1 : 0,
                    },
                    governoratesOrdersCount: {
                        decrement: data.orderData.governorate !== client_1.Governorate.BAGHDAD ? 1 : 0,
                    },
                    totalCost: {
                        decrement: data.orderData.totalCost,
                    },
                    paidAmount: {
                        decrement: data.orderData.paidAmount,
                    },
                    deliveryCost: {
                        decrement: data.orderData.deliveryCost,
                    },
                    clientNet: {
                        decrement: data.orderData.clientNet,
                    },
                    deliveryAgentNet: {
                        decrement: data.orderData.deliveryAgentNet,
                    },
                    companyNet: {
                        decrement: data.orderData.companyNet,
                    },
                },
            }),
        ]);
    }
}
exports.OrdersRepository = OrdersRepository;
//# sourceMappingURL=orders.repository.js.map