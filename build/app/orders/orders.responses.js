"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderTimelineReform = exports.orderTimelineSelect = exports.statisticsReformed = exports.mobileOrderReform = exports.orderReformApiKey = exports.orderReform = exports.orderSelectApiKey = exports.orderSelect = exports.orderStatusArabicNames = exports.orderSecondaryStatusArabicNames = exports.OrderStatusData = void 0;
const client_1 = require("@prisma/client");
exports.OrderStatusData = {
    REGISTERED: {
        name: "مسجل",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/registered.png",
    },
    READY_TO_SEND: {
        name: "جاهز للشحن",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/ready.png",
    },
    WITH_RECEIVING_AGENT: {
        name: "مع مندوب الاستلام",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/receiving.png",
    },
    WITH_DELIVERY_AGENT: {
        name: "بالطريق مع المندوب",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/delivery.png",
    },
    DELIVERED: {
        name: "تم التوصيل",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/delivered.png",
    },
    POSTPONED: {
        name: "مؤجل",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/delay.png",
    },
    RESEND: {
        name: "اعاده إرسال",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/resend.png",
    },
    PROCESSING: {
        name: "قيد المعالجه",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/recovery.png",
    },
    PARTIALLY_RETURNED: {
        name: "راجع حزئي",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/partially.png",
    },
    REPLACED: {
        name: "استبدال",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/replaced.png",
    },
    CHANGE_ADDRESS: {
        name: "تغيير عنوان",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/changeAddress.png",
    },
    RETURNED: {
        name: "راجع كلي",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/returned.png",
    },
    IN_MAIN_REPOSITORY: {
        name: "في المخزن الرئيسي",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/inRepo.png",
    },
    IN_GOV_REPOSITORY: {
        name: "في مخزن الفرع",
        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/inRepo.png",
    },
};
exports.orderSecondaryStatusArabicNames = {
    WITH_CLIENT: "مع العميل",
    WITH_AGENT: "مع المندوب",
    IN_CAR: "في الطريق",
    IN_REPOSITORY: "في المخزن",
    WITH_RECEIVING_AGENT: "مع مندوب الاستلام",
};
exports.orderStatusArabicNames = {
    REGISTERED: "تم الطلب",
    READY_TO_SEND: "جاهز للأرسال",
    WITH_DELIVERY_AGENT: "بالطريق مع المندوب",
    DELIVERED: "تم التوصيل",
    REPLACED: "تم الاستبدال",
    PARTIALLY_RETURNED: "مرتجع جزئي",
    RETURNED: "راجع كلي",
    POSTPONED: "مؤجل",
    CHANGE_ADDRESS: "تغيير عنوان",
    RESEND: "إعادة إرسال",
    WITH_RECEIVING_AGENT: "مع مندوب الاستلام",
    PROCESSING: "قيد المعالجه",
    IN_MAIN_REPOSITORY: "مخزن الفرز الرئيسي",
    IN_GOV_REPOSITORY: "مخزن فرز المحافظه",
};
exports.orderSelect = {
    id: true,
    totalCost: true,
    paidAmount: true,
    deliveryCost: true,
    clientNet: true,
    printed: true,
    deliveryAgentNet: true,
    companyNet: true,
    discount: true,
    branchNet: true,
    receiptNumber: true,
    quantity: true,
    weight: true,
    recipientName: true,
    recipientPhones: true,
    recipientAddress: true,
    notes: true,
    clientNotes: true,
    details: true,
    status: true,
    secondaryStatus: true,
    confirmed: true,
    deliveryType: true,
    deliveryDate: true,
    currentLocation: true,
    createdAt: true,
    updatedAt: true,
    processingStatus: true,
    processed: true,
    processedAt: true,
    forwardedRepo: true,
    forwardedBranchId: true,
    receivedBranchId: true,
    branchDeliveryCost: true,
    processedBy: {
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
            role: true,
        },
    },
    forwarded: true,
    forwardedAt: true,
    forwardedBy: {
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
    },
    forwardedFrom: {
        select: {
            id: true,
            name: true,
            logo: true,
            registrationText: true,
        },
    },
    client: {
        select: {
            showNumbers: true,
            showDeliveryNumber: true,
            branchId: true,
            branch: {
                select: {
                    name: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
            company: {
                select: {
                    name: true,
                },
            },
        },
    },
    deliveryAgent: {
        select: {
            deliveryCost: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
    },
    oldDeliveryAgentId: true,
    orderProducts: {
        select: {
            quantity: true,
            product: true,
            color: true,
            size: true,
        },
    },
    governorate: true,
    location: {
        select: {
            id: true,
            name: true,
        },
    },
    store: {
        select: {
            id: true,
            name: true,
        },
    },
    clientReport: {
        where: {
            report: {
                deleted: false,
            },
        },
        select: {
            id: true,
            secondaryType: true,
            clientId: true,
            storeId: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    repositoryReport: {
        select: {
            id: true,
            secondaryType: true,
            repositoryId: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    branchReport: {
        select: {
            id: true,
            branchId: true,
            type: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    deliveryAgentReport: {
        select: {
            id: true,
            deliveryAgentId: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    governorateReport: {
        select: {
            id: true,
            governorate: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    companyReport: {
        select: {
            id: true,
            secondaryType: true,
            companyId: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    company: {
        select: {
            id: true,
            name: true,
            logo: true,
            registrationText: true,
        },
    },
    branch: {
        select: {
            id: true,
            name: true,
        },
    },
    repository: {
        select: {
            id: true,
            name: true,
        },
    },
    deleted: true,
    deletedAt: true,
    forwardedToGov: true,
    forwardedToMainRepo: true,
    deletedBy: {
        select: {
            id: true,
            name: true,
        },
    },
};
exports.orderSelectApiKey = {
    id: true,
    totalCost: true,
    paidAmount: true,
    deliveryCost: true,
    clientNet: true,
    printed: true,
    receiptNumber: true,
    quantity: true,
    weight: true,
    recipientName: true,
    recipientPhones: true,
    recipientAddress: true,
    clientNotes: true,
    details: true,
    status: true,
    secondaryStatus: true,
    confirmed: true,
    deliveryType: true,
    deliveryDate: true,
    createdAt: true,
    updatedAt: true,
    governorate: true,
    location: {
        select: {
            id: true,
            name: true,
        },
    },
    store: {
        select: {
            id: true,
            name: true,
        },
    },
    clientReport: {
        where: {
            report: {
                deleted: false,
            },
        },
        select: {
            id: true,
            secondaryType: true,
            clientId: true,
            storeId: true,
            report: {
                select: {
                    url: true,
                    deleted: true,
                },
            },
        },
    },
    deleted: true,
    deletedAt: true,
    deletedBy: {
        select: {
            id: true,
            name: true,
        },
    },
};
const orderReform = (order) => {
    if (!order) {
        return null;
    }
    let formedStatus = "";
    formedStatus = exports.orderStatusArabicNames[order.status];
    if (order.secondaryStatus) {
        formedStatus +=
            " - " + exports.orderSecondaryStatusArabicNames[order.secondaryStatus];
    }
    if (order.secondaryStatus === "IN_REPOSITORY") {
        formedStatus += " - " + order.repository?.name;
    }
    const orderReformed = {
        ...order,
        formedStatus,
        // TODO
        client: {
            id: order.client.user.id,
            name: order.client.user.name,
            phone: order.client.user.phone,
            company: order.client.company.name,
            showNumbers: order.client.showNumbers,
            showDeliveryNumber: order.client.showDeliveryNumber,
            branch: order.client.branch?.name,
            branchId: order.client.branchId,
        },
        deliveryAgent: order.deliveryAgent && {
            id: order.deliveryAgent.user.id,
            name: order.deliveryAgent.user.name,
            phone: order.deliveryAgent.user.phone,
            deliveryCost: order.deliveryAgent.deliveryCost,
        },
        processedBy: {
            ...order.processedBy?.user,
            role: order.processedBy?.role,
        },
        forwardedBy: order.forwardedBy?.user,
        deleted: order.deleted,
        deletedBy: order.deleted && order.deletedBy,
        deletedAt: order.deletedAt?.toISOString(),
        clientReport: order.clientReport &&
            order.clientReport.map((report) => ({
                id: report?.id,
                secondaryType: report?.secondaryType,
                clientId: report?.clientId,
                storeId: report?.storeId,
                deleted: report?.report.deleted,
                url: report.report.url,
            })),
        repositoryReport: order.repositoryReport.map((report) => ({
            id: report?.id,
            secondaryType: report?.secondaryType,
            repositoryId: report?.repositoryId,
            deleted: report.report.deleted,
            url: report.report.url,
        })),
        branchReport: order.branchReport.map((report) => ({
            id: report?.id,
            branchId: report?.branchId,
            type: report.type,
            deleted: report.report.deleted,
            url: report.report.url,
        })),
        deliveryAgentReport: order.deliveryAgentReport && {
            id: order.deliveryAgentReport?.id,
            deliveryAgentId: order.deliveryAgentReport?.deliveryAgentId,
            deleted: order.deliveryAgentReport?.report.deleted,
            url: order.deliveryAgentReport?.report.url,
        },
        governorateReport: order.governorateReport && {
            id: order.governorateReport?.id,
            governorate: order.governorateReport?.governorate,
            deleted: order.governorateReport?.report.deleted,
            url: order.governorateReport?.report.url,
        },
        companyReport: order.companyReport.map((report) => ({
            id: report?.id,
            secondaryType: report?.secondaryType,
            companyId: report?.companyId,
            deleted: report.report.deleted,
            url: report.report.url,
        })),
    };
    return orderReformed;
};
exports.orderReform = orderReform;
const orderReformApiKey = (order) => {
    if (!order) {
        return null;
    }
    const orderReformed = {
        ...order,
        deleted: order.deleted,
        deletedBy: order.deleted && order.deletedBy,
        deletedAt: order.deletedAt?.toISOString(),
        clientReport: order.clientReport &&
            order.clientReport.map((report) => ({
                id: report?.id,
                secondaryType: report?.secondaryType,
                clientId: report?.clientId,
                storeId: report?.storeId,
                deleted: report?.report.deleted,
                url: report.report.url,
            })),
    };
    return orderReformed;
};
exports.orderReformApiKey = orderReformApiKey;
const mobileOrderReform = (order) => {
    if (!order) {
        return null;
    }
    let formedStatus = `${order.secondaryStatus === "IN_REPOSITORY" &&
        (order.status === "IN_GOV_REPOSITORY" ||
            order.status === "IN_MAIN_REPOSITORY")
        ? "في " + order.repository?.name
        : order.secondaryStatus === "IN_REPOSITORY"
            ? exports.orderStatusArabicNames[order.status] +
                " " +
                "في " +
                order.repository?.name
            : order.secondaryStatus === "IN_CAR"
                ? "مرسل إلي " + order.repository?.name
                : order.secondaryStatus === "WITH_AGENT" &&
                    order.status !== "WITH_DELIVERY_AGENT" &&
                    order.status !== "WITH_RECEIVING_AGENT"
                    ? exports.orderStatusArabicNames[order.status] + "-" + "مع المندوب"
                    : order.secondaryStatus === "WITH_CLIENT"
                        ? exports.orderStatusArabicNames[order.status] + "-" + "مع العميل"
                        : order.secondaryStatus === "WITH_RECEIVING_AGENT"
                            ? exports.orderStatusArabicNames[order.status] + "-" + "مع مندوب الاستلام"
                            : exports.orderStatusArabicNames[order.status]}`;
    const orderReformed = {
        ...order,
        formedStatus,
        // TODO
        client: {
            id: order.client.user.id,
            name: order.client.user.name,
            phone: order.client.user.phone,
            company: order.client.company.name,
            showNumbers: order.client.showNumbers,
            showDeliveryNumber: order.client.showDeliveryNumber,
        },
        deliveryAgent: order.deliveryAgent && {
            id: order.deliveryAgent.user.id,
            name: order.deliveryAgent.user.name,
            phone: order.deliveryAgent.user.phone,
            deliveryCost: order.deliveryAgent.deliveryCost,
        },
        processedBy: {
            ...order.processedBy?.user,
            role: order.processedBy?.role,
        },
        forwardedBy: order.forwardedBy?.user,
        deleted: order.deleted,
        deletedBy: order.deleted && order.deletedBy,
        deletedAt: order.deletedAt?.toISOString(),
        clientReport: null,
        repositoryReport: null,
        branchReport: order.branchReport.map((report) => ({
            id: report?.id,
            branchId: report?.branchId,
            type: report.type,
            deleted: report.report.deleted,
            url: report.report.url,
        })),
        deliveryAgentReport: order.deliveryAgentReport && {
            id: order.deliveryAgentReport?.id,
            deliveryAgentId: order.deliveryAgentReport?.deliveryAgentId,
            deleted: order.deliveryAgentReport?.report.deleted,
            url: order.deliveryAgentReport.report.url,
        },
        governorateReport: order.governorateReport && {
            id: order.governorateReport?.id,
            governorate: order.governorateReport?.governorate,
            deleted: order.governorateReport?.report.deleted,
            url: order.governorateReport?.report.url,
        },
        companyReport: null,
    };
    return orderReformed;
};
exports.mobileOrderReform = mobileOrderReform;
/* --------------------------------------------------------------- */
const statisticsReformed = (statistics) => {
    const sortingOrder = [
        "REGISTERED",
        "READY_TO_SEND",
        "DELIVERED",
        "WITH_RECEIVING_AGENT",
        "WITH_DELIVERY_AGENT",
        "POSTPONED",
        "RESEND",
        "PROCESSING",
        "PARTIALLY_RETURNED",
        "REPLACED",
        "CHANGE_ADDRESS",
        "RETURNED",
        "IN_MAIN_REPOSITORY",
        "IN_GOV_REPOSITORY",
    ];
    const statisticsReformed = {
        ordersStatisticsByStatus: Object.keys(client_1.OrderStatus)
            .map((status) => {
            const statusCount = statistics.ordersStatisticsByStatus.find((orderStatus) => {
                return orderStatus.status === status;
            });
            return {
                status: status,
                totalCost: statusCount?._sum.totalCost || 0,
                count: statusCount?._count.id || 0,
                name: exports.OrderStatusData[status].name,
                icon: exports.OrderStatusData[status].icon,
                inside: false,
            };
        })
            .sort((a, b) => {
            return sortingOrder.indexOf(a.status) - sortingOrder.indexOf(b.status);
        }),
        ordersStatisticsByGovernorate: Object.keys(client_1.Governorate).map((governorate) => {
            const governorateCount = statistics.ordersStatisticsByGovernorate.find((orderStatus) => {
                return orderStatus.governorate === governorate;
            });
            return {
                governorate: governorate,
                totalCost: governorateCount?._sum.totalCost || 0,
                count: governorateCount?._count.id || 0,
            };
        }),
        allOrdersStatistics: {
            totalCost: statistics.allOrdersStatistics._sum.totalCost || 0,
            count: statistics.allOrdersStatistics._count.id,
        },
        allOrdersStatisticsWithoutClientReport: {
            totalCost: (statistics.allOrdersStatisticsWithoutClientReport._sum?.paidAmount ??
                0) -
                (statistics.allOrdersStatisticsWithoutClientReport._sum?.deliveryCost ??
                    0),
            deliveryCost: statistics.allOrdersStatisticsWithoutClientReport._sum.deliveryCost ||
                0,
            count: statistics.allOrdersStatisticsWithoutClientReport._count.id,
        },
        allOrdersStatisticsWithoutDeliveryReport: {
            totalCost: statistics.allOrdersStatisticsWithoutDeliveryReport._sum.paidAmount ||
                0,
            deliveryCost: statistics.allOrdersStatisticsWithoutDeliveryReport._sum
                .deliveryAgentNet || 0,
            count: statistics.allOrdersStatisticsWithoutDeliveryReport._count.id,
        },
        allOrdersStatisticsWithoutBranchReport: {
            totalCost: statistics.allOrdersStatisticsWithoutDeliveryReport._sum.paidAmount ||
                0,
            count: statistics.allOrdersStatisticsWithoutDeliveryReport._count.id,
        },
        allOrdersStatisticsWithoutCompanyReport: {
            totalCost: statistics.allOrdersStatisticsWithoutDeliveryReport._sum.paidAmount ||
                0,
            count: statistics.allOrdersStatisticsWithoutDeliveryReport._count.id,
        },
        todayOrdersStatistics: {
            totalCost: statistics.todayOrdersStatistics._sum.totalCost || 0,
            count: statistics.todayOrdersStatistics._count.id,
        },
    };
    return statisticsReformed;
};
exports.statisticsReformed = statisticsReformed;
exports.orderTimelineSelect = {
    id: true,
    type: true,
    old: true,
    new: true,
    createdAt: true,
    by: true,
    message: true,
};
const orderTimelineReform = (timeline) => {
    return {
        id: timeline.id,
        type: timeline.type,
        date: timeline.createdAt,
        message: timeline.message,
        old: timeline.old && JSON.parse(timeline.old),
        new: timeline.new && JSON.parse(timeline.new),
        by: timeline.by,
    };
};
exports.orderTimelineReform = orderTimelineReform;
//# sourceMappingURL=orders.responses.js.map