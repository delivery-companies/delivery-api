import {OrderStatus} from "@prisma/client";
import {prisma} from "../../../database/db";
import {localizeOrderStatus} from "../../../lib/localize";
import {Logger} from "../../../lib/logger";
import {sendNotification} from "../../notifications/helpers/sendNotification";
import {OrdersRepository} from "../../orders/orders.repository";
// import { OrderTimelineType } from "../../orders/orders.dto";

const ordersRepository = new OrdersRepository();

export const automaticUpdatesTask = async () => {
  try {
    const currentDate = new Date();

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        orderStatusAutomaticUpdate: true,
      },
    });

    for (const company of companies) {
      const automaticUpdates = await prisma.automaticUpdate.findMany({
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
        const orders = await prisma.order.findMany({
          where: {
            company: {
              id: company.id,
            },
            status: automaticUpdate.orderStatus,
            notes:
              automaticUpdate.notes && automaticUpdate.notes !== ""
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
          const hours24 = lastUpdate.getHours();
          let paidAmount: number | undefined = undefined;
          let clientNet: number | undefined = undefined;

          if (
            automaticUpdate.checkAfter &&
            hoursDifference < automaticUpdate.checkAfter
          ) {
            continue;
          } else if (
            automaticUpdate.updateAt &&
            automaticUpdate.updateAt + 3 < hours24
          ) {
            continue;
          }

          if (
            order?.status !== automaticUpdate.newOrderStatus &&
            (automaticUpdate.newOrderStatus === OrderStatus.DELIVERED ||
              automaticUpdate.newOrderStatus ===
                OrderStatus.PARTIALLY_RETURNED ||
              automaticUpdate.newOrderStatus === OrderStatus.REPLACED) &&
            order.paidAmount === 0
          ) {
            paidAmount = order?.totalCost;
            clientNet = order?.paidAmount - order.deliveryCost;
          }

          const newOrder = await prisma.order.update({
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
              message: `تم تغيير حالة الطلب من ${localizeOrderStatus(
                order.status
              )} إلى ${localizeOrderStatus(automaticUpdate.newOrderStatus)}`,
            },
          });

          order.client &&
            (await sendNotification({
              userID: order.client.id,
              title: "تم تغيير حالة الطلب",
              content: `تم تغيير حالة الطلب رقم ${
                order.id
              } إلى ${localizeOrderStatus(automaticUpdate.newOrderStatus)}`,
            }));

          order.deliveryAgent &&
            (await sendNotification({
              userID: order.deliveryAgent.id,
              title: "تم تغيير حالة الطلب",
              content: `تم تغيير حالة الطلب رقم ${
                order.id
              } إلى ${localizeOrderStatus(automaticUpdate.newOrderStatus)}`,
            }));

          Logger.info(
            `Automatic update for order with ID: ${order.id} has been completed.`
          );
        }
      }
    }

    Logger.info("Automatic updates task has been completed.");
  } catch (error) {
    Logger.error("Error in automatic updates task", error);
  }
};
