"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automaticUpdatesTask = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../../database/db");
const localize_1 = require("../../../lib/localize");
const logger_1 = require("../../../lib/logger");
const sendNotification_1 = require("../../notifications/helpers/sendNotification");
const orders_repository_1 = require("../../orders/orders.repository");
// import { OrderTimelineType } from "../../orders/orders.dto";
const ordersRepository = new orders_repository_1.OrdersRepository();
const automaticUpdatesTask = async () => {
    try {
        const currentDate = new Date();
        const companies = await db_1.prisma.company.findMany({
            select: {
                id: true,
                orderStatusAutomaticUpdate: true,
            },
        });
        for (const company of companies) {
            const automaticUpdates = await db_1.prisma.automaticUpdate.findMany({
                where: {
                    company: {
                        id: company.id,
                    },
                    enabled: true,
                },
                select: {
                    id: true,
                    orderStatus: true,
                    // newStatus: true,
                    notes: true,
                    branch: {
                        select: {
                            id: true,
                        },
                    },
                    checkAfter: true,
                    updateAt: true,
                    returnCondition: true,
                    newOrderStatus: true,
                },
            });
            for (const automaticUpdate of automaticUpdates) {
                const orders = await db_1.prisma.order.findMany({
                    where: {
                        company: {
                            id: company.id,
                        },
                        status: automaticUpdate.orderStatus,
                        notes: automaticUpdate.notes && automaticUpdate.notes !== ""
                            ? automaticUpdate.notes
                            : undefined,
                        branch: {
                            id: automaticUpdate.branch.id,
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                        updatedAt: true,
                        paidAmount: true,
                        deliveryCost: true,
                        totalCost: true,
                        createdAt: true,
                        client: {
                            select: {
                                id: true,
                            },
                        },
                        deliveryAgent: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });
                if (!orders) {
                    return;
                }
                for (const order of orders) {
                    const lastUpdate = new Date(order.updatedAt);
                    const difference = currentDate.getTime() - lastUpdate.getTime();
                    const hoursDifference = difference / (1000 * 3600);
                    let paidAmount = undefined;
                    let clientNet = undefined;
                    const updateHour = automaticUpdate.updateAt === 24 ? 0 : automaticUpdate.updateAt; // handle midnight
                    const currentHour = currentDate.getHours();
                    if (automaticUpdate.checkAfter &&
                        hoursDifference < automaticUpdate.checkAfter) {
                        continue;
                    }
                    else if (currentHour < updateHour) {
                        continue;
                    }
                    if (order?.status !== automaticUpdate.newOrderStatus &&
                        (automaticUpdate.newOrderStatus === client_1.OrderStatus.DELIVERED ||
                            automaticUpdate.newOrderStatus ===
                                client_1.OrderStatus.PARTIALLY_RETURNED ||
                            automaticUpdate.newOrderStatus === client_1.OrderStatus.REPLACED) &&
                        order.paidAmount === 0) {
                        paidAmount = order?.totalCost;
                        clientNet = order?.paidAmount - order.deliveryCost;
                    }
                    const newOrder = await db_1.prisma.order.update({
                        where: {
                            id: order.id,
                        },
                        data: {
                            status: automaticUpdate.newOrderStatus,
                            secondaryStatus: automaticUpdate.returnCondition,
                            paidAmount: paidAmount,
                            clientNet: clientNet,
                            automaticUpdate: {
                                connect: {
                                    id: automaticUpdate.id,
                                },
                            },
                        },
                    });
                    await ordersRepository.updateOrderTimeline({
                        orderID: order.id,
                        data: {
                            type: "STATUS_CHANGE",
                            date: newOrder.updatedAt,
                            old: {
                                value: order.status,
                            },
                            new: {
                                value: automaticUpdate.newOrderStatus,
                            },
                            by: {
                                id: 0,
                                name: "التحديث التلقائي",
                            },
                            message: `تم تغيير حالة الطلب من ${(0, localize_1.localizeOrderStatus)(order.status)} إلى ${(0, localize_1.localizeOrderStatus)(automaticUpdate.newOrderStatus)}`,
                        },
                    });
                    order.client &&
                        (await (0, sendNotification_1.sendNotification)({
                            userID: order.client.id,
                            title: "تم تغيير حالة الطلب",
                            content: `تم تغيير حالة الطلب رقم ${order.id} إلى ${(0, localize_1.localizeOrderStatus)(automaticUpdate.newOrderStatus)}`,
                        }));
                    order.deliveryAgent &&
                        (await (0, sendNotification_1.sendNotification)({
                            userID: order.deliveryAgent.id,
                            title: "تم تغيير حالة الطلب",
                            content: `تم تغيير حالة الطلب رقم ${order.id} إلى ${(0, localize_1.localizeOrderStatus)(automaticUpdate.newOrderStatus)}`,
                        }));
                    logger_1.Logger.info(`Automatic update for order with ID: ${order.id} has been completed.`);
                }
            }
        }
        logger_1.Logger.info("Automatic updates task has been completed.");
    }
    catch (error) {
        logger_1.Logger.error("Error in automatic updates task", error);
    }
};
exports.automaticUpdatesTask = automaticUpdatesTask;
//# sourceMappingURL=automaticUpdatesTask.js.map