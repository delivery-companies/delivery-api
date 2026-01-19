"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsRepository = void 0;
const db_1 = require("../../database/db");
const transactions_responses_1 = require("./transactions.responses");
const reports_responses_1 = require("../reports/reports.responses");
class TransactionsRepository {
    async createTransaction(companyId, branchId, data) {
        if (!companyId) {
            throw new Error("companyId is required to create a transaction");
        }
        const transaction = await db_1.prisma.transaction.create({
            data: {
                type: data.type,
                paidAmount: data.paidAmount,
                for: data.for,
                employeeId: data.employeeId ?? null,
                createdById: data.createdById ?? null,
                branchId: branchId,
                companyId,
            },
            select: transactions_responses_1.transactionSelect,
        });
        return transaction;
    }
    async getAllTransactionsPaginated(filters) {
        let startDate = new Date();
        let endDate = new Date();
        const isMainRepository = filters.loggedInUser?.mainRepository ||
            filters.loggedInUser?.role === "COMPANY_MANAGER";
        const mainBranch = await db_1.prisma.branch.findFirst({
            where: {
                companyId: filters.companyId,
                repositories: {
                    some: {
                        mainRepository: true,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        if (filters.start_date) {
            startDate = new Date(filters.start_date);
            startDate.setUTCDate(startDate.getUTCDate() - 1);
            startDate.setHours(21, 0, 0, 0);
        }
        if (filters.end_date) {
            endDate = new Date(filters.end_date);
            endDate.setHours(21, 0, 0, 0);
        }
        const receivedFromAgents = await db_1.prisma.order.aggregate({
            _sum: {
                companyNet: true,
            },
            _count: {
                id: true,
            },
            where: {
                AND: [
                    { companyId: filters.companyId },
                    { deleted: false },
                    {
                        deliveryAgent: {
                            branchId: filters.branchId,
                        },
                    },
                    {
                        createdAt: filters.start_date
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    {
                        createdAt: filters.end_date
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    { deliveryAgentId: filters.deliveryAgentId },
                    {
                        OR: [
                            { deliveryAgentReport: { isNot: null } },
                            {
                                deliveryAgentReport: {
                                    report: { deleted: true },
                                },
                            },
                        ],
                    },
                ],
            },
        });
        const agentProfit = await db_1.prisma.report.aggregate({
            _sum: {
                deliveryAgentNet: true,
            },
            _count: {
                id: true,
            },
            where: {
                AND: [
                    {
                        createdAt: filters.start_date
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    {
                        createdAt: filters.end_date
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    { companyId: filters.companyId },
                    { deleted: false },
                    {
                        deliveryAgentReport: {
                            deliveryAgentId: filters.deliveryAgentId,
                            deliveryAgent: {
                                branchId: filters.branchId,
                            },
                        },
                    },
                ],
            },
        });
        const notReceived = await db_1.prisma.order.aggregate({
            _sum: {
                paidAmount: true,
            },
            _count: {
                id: true,
            },
            where: {
                companyId: filters.companyId,
                deleted: false,
                status: { in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"] },
                deliveryAgent: {
                    branchId: filters.branchId,
                },
                deliveryAgentId: filters.deliveryAgentId,
                OR: [
                    { deliveryAgentReport: { is: null } },
                    {
                        deliveryAgentReport: {
                            report: { deleted: true },
                        },
                    },
                ],
            },
        });
        const forClients = await db_1.prisma.order.aggregate({
            _sum: {
                clientNet: true,
            },
            where: {
                companyId: filters.companyId,
                deleted: false,
                status: { in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"] },
                clientId: filters.clientId,
                client: {
                    branchId: filters.branchId,
                },
                OR: [
                    {
                        clientReport: {
                            none: {
                                secondaryType: "DELIVERED",
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
                ],
            },
        });
        const paidToClients = await db_1.prisma.report.aggregate({
            _sum: {
                clientNet: true,
            },
            where: {
                AND: [
                    { companyId: filters.companyId },
                    { deleted: false },
                    {
                        createdAt: filters.start_date
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    {
                        createdAt: filters.end_date
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    {
                        clientReport: {
                            clientId: filters.clientId,
                            client: {
                                branchId: filters.branchId,
                            },
                            secondaryType: "DELIVERED",
                            report: {
                                deleted: false,
                            },
                        },
                    },
                ],
            },
        });
        const forwardedReports = await db_1.prisma.branchReport.findMany({
            where: {
                branchId: isMainRepository ? undefined : filters.branchId,
                report: {
                    companyId: filters.companyId,
                    deleted: false,
                },
                type: "forwarded",
            },
            include: {
                orders: {
                    where: {
                        AND: [
                            { deleted: false },
                            { deliveryAgentId: filters.deliveryAgentId },
                            { clientId: filters.clientId },
                            {
                                createdAt: filters.start_date
                                    ? {
                                        gt: startDate,
                                    }
                                    : undefined,
                            },
                            {
                                createdAt: filters.end_date
                                    ? {
                                        lt: endDate,
                                    }
                                    : undefined,
                            },
                        ],
                    },
                    select: {
                        governorate: true,
                        deliveryCost: true,
                    },
                },
            },
        });
        const receivedReports = await db_1.prisma.branchReport.findMany({
            where: {
                branchId: isMainRepository ? undefined : filters.branchId,
                report: {
                    companyId: filters.companyId,
                    deleted: false,
                },
                type: "received",
            },
            include: {
                orders: {
                    where: {
                        AND: [
                            { deleted: false },
                            { deliveryAgentId: filters.deliveryAgentId },
                            { clientId: filters.clientId },
                            {
                                createdAt: filters.start_date
                                    ? {
                                        gt: startDate,
                                    }
                                    : undefined,
                            },
                            {
                                createdAt: filters.end_date
                                    ? {
                                        lt: endDate,
                                    }
                                    : undefined,
                            },
                        ],
                    },
                    select: {
                        governorate: true,
                        deliveryAgentNet: true,
                        client: {
                            select: {
                                branchId: true,
                            },
                        },
                        deliveryCost: true,
                    },
                },
            },
        });
        const toBranch = await db_1.prisma.report.aggregate({
            _sum: {
                branchNet: true,
                paidAmount: true,
            },
            where: {
                type: "BRANCH",
                companyId: filters.companyId,
                branchReport: {
                    branchId: isMainRepository ? undefined : filters.branchId,
                    type: isMainRepository ? "forwarded" : "received",
                },
            },
        });
        const fromBranch = await db_1.prisma.report.aggregate({
            _sum: {
                branchNet: true,
                clientNet: true,
            },
            where: {
                type: "BRANCH",
                companyId: filters.companyId,
                branchReport: {
                    branchId: isMainRepository ? undefined : filters.branchId,
                    type: isMainRepository ? "received" : "forwarded",
                },
            },
        });
        const insideOrders = await db_1.prisma.order.aggregate({
            _sum: {
                companyNet: true,
                clientNet: true,
            },
            _count: {
                id: true,
            },
            where: {
                AND: [
                    {
                        companyId: filters.companyId,
                    },
                    {
                        branch: {
                            id: filters.branchId,
                        },
                    },
                    { deleted: false },
                    {
                        client: {
                            branchId: filters.branchId,
                        },
                    },
                    {
                        createdAt: filters.start_date
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    {
                        createdAt: filters.end_date
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    { clientId: filters.clientId },
                    { deliveryAgentId: filters.deliveryAgentId },
                    {
                        OR: [
                            { deliveryAgentReport: { isNot: null } },
                            {
                                deliveryAgentReport: {
                                    report: { deleted: true },
                                },
                            },
                        ],
                    },
                ],
            },
        });
        const paginatedTransactions = await db_1.prisma.report.findManyPaginated({
            where: {
                AND: [
                    { companyId: filters.companyId },
                    {
                        createdAt: filters.start_date
                            ? {
                                gt: startDate,
                            }
                            : undefined,
                    },
                    {
                        createdAt: filters.end_date
                            ? {
                                lt: endDate,
                            }
                            : undefined,
                    },
                    {
                        type: filters.clientId
                            ? "CLIENT"
                            : filters.deliveryAgentId
                                ? "DELIVERY_AGENT"
                                : filters.type
                                    ? "BRANCH"
                                    : { in: ["BRANCH", "DELIVERY_AGENT", "CLIENT"] },
                    },
                    {
                        OR: [
                            {
                                branchReport: {
                                    type: filters.type === "forwardedAll"
                                        ? "forwarded"
                                        : filters.type === "receivedAll"
                                            ? "received"
                                            : undefined,
                                    branchId: isMainRepository ? undefined : filters.branchId,
                                    id: { gt: -1 },
                                },
                            },
                            {
                                clientReport: {
                                    secondaryType: "DELIVERED",
                                    clientId: filters.clientId,
                                    client: {
                                        branchId: isMainRepository
                                            ? mainBranch?.id
                                            : filters.branchId,
                                    },
                                },
                            },
                            {
                                deliveryAgentReport: {
                                    deliveryAgentId: filters.deliveryAgentId,
                                    deliveryAgent: {
                                        branchId: isMainRepository
                                            ? mainBranch?.id
                                            : filters.branchId,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            select: reports_responses_1.reportSelect,
            orderBy: {
                id: "desc",
            },
        }, {
            page: filters.page,
            size: filters.size,
        });
        const reportsReformed = paginatedTransactions.data.map((report) => (0, reports_responses_1.reportReform)(report));
        let totalDepoist = 0;
        let totalWithdraw = 0;
        let branchProfit = 0;
        totalDepoist += receivedFromAgents._sum.companyNet || 0;
        totalDepoist += fromBranch._sum.branchNet || 0;
        totalWithdraw += toBranch._sum.branchNet || 0;
        totalWithdraw += paidToClients._sum.clientNet || 0;
        if (filters.type !== "inside") {
            if (filters.type === "forwardedAll") {
                forwardedReports.forEach((report) => {
                    report.orders.forEach((order) => {
                        if (order.governorate === "BAGHDAD") {
                            branchProfit += isMainRepository
                                ? report.baghdadDeliveryCost
                                : order.deliveryCost - report.baghdadDeliveryCost;
                        }
                        else {
                            branchProfit += isMainRepository
                                ? report.governoratesDeliveryCost
                                : order.deliveryCost - report.governoratesDeliveryCost;
                        }
                    });
                });
            }
            else if (filters.type === "receivedAll") {
                receivedReports.forEach((report) => {
                    report.orders.forEach((order) => {
                        if (order.client.branchId === mainBranch?.id && isMainRepository) {
                            if (order.governorate === "BAGHDAD") {
                                branchProfit += order.deliveryCost - report.baghdadDeliveryCost;
                            }
                            else {
                                branchProfit +=
                                    order.deliveryCost - report.governoratesDeliveryCost;
                            }
                        }
                        else {
                            if (order.governorate === "BAGHDAD") {
                                branchProfit += isMainRepository
                                    ? -report.baghdadDeliveryCost
                                    : report.baghdadDeliveryCost - order.deliveryAgentNet;
                            }
                            else {
                                branchProfit += isMainRepository
                                    ? -report.governoratesDeliveryCost
                                    : report.governoratesDeliveryCost - order.deliveryAgentNet;
                            }
                        }
                    });
                });
            }
            else {
                forwardedReports.forEach((report) => {
                    report.orders.forEach((order) => {
                        if (order.governorate === "BAGHDAD") {
                            branchProfit += isMainRepository
                                ? report.baghdadDeliveryCost
                                : order.deliveryCost - report.baghdadDeliveryCost;
                        }
                        else {
                            branchProfit += isMainRepository
                                ? report.governoratesDeliveryCost
                                : order.deliveryCost - report.governoratesDeliveryCost;
                        }
                    });
                });
                receivedReports.forEach((report) => {
                    report.orders.forEach((order) => {
                        if (order.client.branchId === mainBranch?.id && isMainRepository) {
                            if (order.governorate === "BAGHDAD") {
                                branchProfit += order.deliveryCost - report.baghdadDeliveryCost;
                            }
                            else {
                                branchProfit +=
                                    order.deliveryCost - report.governoratesDeliveryCost;
                            }
                        }
                        else {
                            if (order.governorate === "BAGHDAD") {
                                branchProfit += isMainRepository
                                    ? -report.baghdadDeliveryCost
                                    : report.baghdadDeliveryCost - order.deliveryAgentNet;
                            }
                            else {
                                branchProfit += isMainRepository
                                    ? -report.governoratesDeliveryCost
                                    : report.governoratesDeliveryCost - order.deliveryAgentNet;
                            }
                        }
                    });
                });
            }
        }
        if (filters.type === "inside" || !filters.type) {
            branchProfit += insideOrders._sum.companyNet || 0;
            branchProfit -= insideOrders._sum.clientNet || 0;
        }
        return {
            transactions: reportsReformed,
            pagesCount: paginatedTransactions.pagesCount,
            count: paginatedTransactions.dataCount,
            totalDepoist,
            totalWithdraw,
            branchProfit,
            receivedFromAgents: receivedFromAgents._sum.companyNet,
            agentProfit: agentProfit._sum.deliveryAgentNet,
            notReceived: notReceived._sum.paidAmount,
            forClients: forClients._sum.clientNet,
            paidToClients: paidToClients._sum.clientNet,
        };
    }
    async getCompanyNetGroupedByCreatedBy(companyId, page = 1, size = 10) {
        const groupedResults = await db_1.prisma.report.groupBy({
            by: ["employeeId"],
            where: {
                type: "DELIVERY_AGENT",
                companyId,
                deleted: false,
            },
            _sum: {
                companyNet: true,
            },
            orderBy: {
                employeeId: "asc",
            },
        });
        const totalGroups = groupedResults.length;
        const pagesCount = Math.ceil(totalGroups / size);
        const start = (page - 1) * size;
        const paginated = groupedResults.slice(start, start + size);
        const transactionsGrouped = await db_1.prisma.transaction.groupBy({
            by: ["employeeId", "type"],
            where: {
                companyId,
                employeeId: { in: paginated.map((r) => r.employeeId) },
            },
            _sum: {
                paidAmount: true,
            },
            orderBy: {
                employeeId: "asc",
            },
        });
        const summaryMap = new Map();
        for (const record of transactionsGrouped) {
            const employeeId = record.employeeId;
            const sum = record._sum.paidAmount || 0;
            if (!summaryMap.has(employeeId)) {
                summaryMap.set(employeeId, { deposit: 0, withdraw: 0 });
            }
            if (record.type === "DEPOSIT") {
                summaryMap.get(employeeId).deposit += sum;
            }
            else if (record.type === "WITHDRAW") {
                summaryMap.get(employeeId).withdraw += sum;
            }
        }
        // Fetch employee names for better readability
        const employees = await db_1.prisma.employee.findMany({
            where: {
                id: { in: paginated.map((r) => r.employeeId) },
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        // Combine names with totals
        const grouped = paginated.map((r) => {
            const emp = employees.find((e) => e.user.id === r.employeeId);
            const values = summaryMap.get(r.employeeId);
            return {
                employeeId: r.employeeId,
                employeeName: emp?.user.name || "غير معروف",
                totalCompanyNet: r._sum.companyNet || 0,
                totalDeposit: values ? values?.deposit : 0,
                totalWithdraw: values ? values?.withdraw : 0,
            };
        });
        return {
            data: grouped,
            page,
            pagesCount,
            totalGroups,
        };
    }
    async getTransaction(data) {
        const transaction = await db_1.prisma.transaction.findUnique({
            where: { id: data.transactionId },
            select: transactions_responses_1.transactionSelect,
        });
        return transaction;
    }
    async updateTransaction(data) {
        const transaction = await db_1.prisma.transaction.update({
            where: { id: data.transactionId },
            data: data.transactionData,
            select: transactions_responses_1.transactionSelect,
        });
        return transaction;
    }
    async deleteTransaction(data) {
        await db_1.prisma.transaction.delete({
            where: { id: data.transactionId },
        });
        return true;
    }
}
exports.TransactionsRepository = TransactionsRepository;
//# sourceMappingURL=transactions.repository.js.map