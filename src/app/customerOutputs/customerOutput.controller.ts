import {catchAsync} from "../../lib/catchAsync";
import {prisma} from "../../database/db";
import {orderReform, orderSelect} from "../orders/orders.responses";
import {AppError} from "../../lib/AppError";
import {loggedInUserType} from "../../types/user";
import {ReportsRepository} from "../reports/reports.repository";
import {sendNotification} from "../notifications/helpers/sendNotification";
import {OrdersRepository} from "../orders/orders.repository";
import {ReportType} from "@prisma/client";
import {localizeReportType} from "../../lib/localize";
import {generateReport} from "../reports/helpers/generateReport";

const reportsRepository = new ReportsRepository();
const ordersRepository = new OrdersRepository();

export class CustomerOutputController {
  saveOrderInCache = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const {orderId, companyId, type, repository, storeId} = req.body;

    let order = await prisma.order.findFirst({
      where: {
        receiptNumber: orderId,
      },
      select: orderSelect,
    });

    if (!order) {
      throw new AppError("الطلب غير موجود", 404);
    }

    if (order.secondaryStatus !== "IN_REPOSITORY") {
      throw new AppError("قم بإدخال الطلب للمخزن اولا!", 404);
    }

    if (type === "company" && +companyId !== +order.company.id) {
      throw new AppError("هذا الطلب غير تابع لهذه الشركه", 404);
    }

    if (type === "client" && +storeId !== +order.store.id) {
      throw new AppError("هذا الطلب غير تابع لهذا المتجر", 404);
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        clientId: true,
      },
    });

    const userRepository = await prisma.employee.findUnique({
      where: {
        id: loggedInUser.id,
      },
      select: {
        branch: {
          select: {
            id: true,
            repositories: {
              select: {
                id: true,
                type: true,
                name: true,
                mainRepository: true,
              },
            },
          },
        },
      },
    });

    const returnsRepo = userRepository?.branch?.repositories.find(
      (repo) => repo.type === "RETURN"
    );

    if (!returnsRepo) {
      throw new AppError("لا يوجد مخزن راوجع لهذا الفرع!", 404);
    }

    if (type === "repository") {
      const targetRepository = await prisma.repository.findUnique({
        where: {
          id: +repository,
        },
        select: {
          branchId: true,
          mainRepository: true,
        },
      });
      if (
        !targetRepository?.mainRepository &&
        targetRepository?.branchId !== order.client.branchId
      ) {
        throw new AppError("هذا العميل غير تابع لهذا الفرع!", 404);
      }
    }

    const checkIfExist = await prisma.customerOutput.findFirst({
      where: {
        orderId: order.id,
        clientId: type === "client" ? store?.clientId : undefined,
        targetRepositoryId: type === "repository" ? repository : undefined,
        companyId: type === "company" ? companyId : undefined,
      },
      select: {
        id: true,
      },
    });

    if (checkIfExist) {
      throw new AppError("هذا الطلب موجود بالفعل!", 404);
    }

    if (type === "repository") {
      const newOrder = await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          secondaryStatus: "IN_CAR",
          repositoryId: +repository,
          forwardedRepo: returnsRepo.id,
        },
        select: orderSelect,
      });

      await ordersRepository.updateOrderTimeline({
        orderID: order.id,
        data: {
          type: "REPOSITORY_CHANGE",
          date: newOrder.updatedAt,
          old: order.repository && {
            id: order.repository.id,
            name: order.repository.name,
          },
          new: newOrder.repository && {
            id: newOrder.repository.id,
            name: newOrder.repository.name,
          },
          by: {
            id: loggedInUser.id,
            name: loggedInUser.name,
          },
          message: `تم ارسال الطلب الي مخزن ${repository}`,
        },
      });
    }

    if (type === "company") {
      await prisma.order.updateMany({
        where: {
          id: order.id,
        },
        data: {
          secondaryStatus: "WITH_AGENT",
          repositoryId: null,
          forwardedRepo: returnsRepo.id,
        },
      });
    }

    await prisma.customerOutput.create({
      data: {
        orderId: order.id,
        clientId: store ? store.clientId : null,
        storeId: storeId ? storeId : null,
        companyId: companyId ? companyId : null,
        repositoryId: returnsRepo.id,
        targetRepositoryId: repository ? repository : null,
      },
    });

    res.status(200).json({
      status: "success",
    });
  });

  getCustomerOldData = catchAsync(async (req, res) => {
    const {companyId, size, page, type, repository, storeId} = req.query;

    const loggedInUser = res.locals.user as loggedInUserType;

    const userRepository = await prisma.employee.findUnique({
      where: {
        id: loggedInUser.id,
      },
      select: {
        branch: {
          select: {
            id: true,
            repositories: {
              select: {
                id: true,
                type: true,
                name: true,
                mainRepository: true,
              },
            },
          },
        },
      },
    });

    const returnsRepo = userRepository?.branch?.repositories.find(
      (repo) => repo.type === "RETURN"
    );

    if (!returnsRepo) {
      throw new AppError("لا يوجد مخزن راوجع لهذا الفرع!", 404);
    }

    const results = await prisma.customerOutput.findManyPaginated(
      {
        where: {
          AND: [
            {repositoryId: returnsRepo.id},
            type === "client"
              ? {storeId: storeId ? +storeId : undefined}
              : type === "company"
              ? {companyId: companyId ? +companyId : undefined}
              : {targetRepositoryId: repository ? +repository : undefined},
          ],
        },
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          order: {
            select: orderSelect,
          },
        },
      },
      {
        page: page ? +page : 1,
        size: size ? +size : 10,
      }
    );

    const newData = results.data.map((order) => orderReform(order.order));
    res.status(200).json({
      status: "success",
      data: {
        count: results.dataCount,
        pageCount: results.pagesCount,
        currentPage: results.currentPage,
        orders: newData,
      },
    });
  });

  saveAndCreateReport = catchAsync(async (req, res) => {
    const {
      companyId,
      type,
      storeId,
      repositoryId,
      repositoryName,
      receivingAgentId,
    } = req.body;

    let ordersIDs: string[] = [];

    const loggedInUser = res.locals.user as loggedInUserType;

    const userRepository = await prisma.employee.findUnique({
      where: {
        id: loggedInUser.id,
      },
      select: {
        branch: {
          select: {
            id: true,
            repositories: {
              select: {
                id: true,
                type: true,
                name: true,
                mainRepository: true,
              },
            },
          },
        },
      },
    });

    const returnsRepo = userRepository?.branch?.repositories.find(
      (repo) => repo.type === "RETURN"
    );

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        clientId: true,
      },
    });

    if (!returnsRepo) {
      throw new AppError("لا يوجد مخزن راوجع لهذا الفرع!", 404);
    }

    const results = await prisma.customerOutput.findManyPaginated(
      {
        where: {
          AND: [
            {repositoryId: returnsRepo.id},
            type === "client" ? {storeId: storeId ? +storeId : null} : {},
            type === "client"
              ? {clientId: store ? +store.clientId : null}
              : type === "company"
              ? {companyId: companyId ? +companyId : null}
              : {targetRepositoryId: repositoryId},
          ],
        },
        select: {
          id: true,
          order: {
            select: orderSelect,
          },
        },
      },
      {
        page: 1,
        size: 5000,
      }
    );

    const orders = results.data.map((order) => orderReform(order.order));

    if (!results || results.data.length === 0) {
      throw new AppError("لا يوجد طلبات لعمل الكشف", 400);
    }

    const reportMetaData = {
      baghdadOrdersCount: 0,
      governoratesOrdersCount: 0,
      totalCost: 0,
      paidAmount: 0,
      deliveryCost: 0,
      clientNet: 0,
      deliveryAgentNet: 0,
      companyNet: 0,
      branchNet: 0,
    };

    for (const order of orders) {
      // @ts-expect-error Fix later
      ordersIDs.push(order?.id);
      // @ts-expect-error Fix later
      reportMetaData.totalCost += +order.totalCost;
      // @ts-expect-error Fix later
      reportMetaData.paidAmount += +order.paidAmount;
      // @ts-expect-error Fix later
      reportMetaData.deliveryCost += +order.deliveryCost;
      // @ts-expect-error Fix later
      reportMetaData.clientNet += +order.clientNet;
      // @ts-expect-error Fix later
      reportMetaData.deliveryAgentNet += order.deliveryAgentNet;
      // @ts-expect-error Fix later
      reportMetaData.companyNet += +order.companyNet;
      // @ts-expect-error Fix later
      if (order.governorate === "BAGHDAD") {
        reportMetaData.baghdadOrdersCount++;
      } else {
        reportMetaData.governoratesOrdersCount++;
      }
    }

    const report = await reportsRepository.createReport({
      loggedInUser: loggedInUser,
      reportData: {
        type:
          type === "client"
            ? "CLIENT"
            : type === "company"
            ? "COMPANY"
            : "REPOSITORY",
        secondaryType: "RETURNED",
        clientID: store?.clientId,
        companyID: companyId,
        baghdadDeliveryCost: 0,
        governoratesDeliveryCost: 0,
        storeID: storeId,
        repositoryID: returnsRepo.id,
        repositoryName: repositoryName,
        targetRepositoryId: repositoryId,
        ordersIDs: ordersIDs,
        receivingAgentId: receivingAgentId,
      },
      reportMetaData: reportMetaData,
    });

    if (!report) {
      throw new AppError("حدث خطأ اثناء عمل الكشف", 500);
    }

    // // if client report, make secondary status WITH_CLIENT
    if (type === "client") {
      await prisma.order.updateMany({
        where: {
          id: {
            in: ordersIDs,
          },
        },
        data: {
          secondaryStatus: receivingAgentId
            ? "WITH_RECEIVING_AGENT"
            : "WITH_CLIENT",
          repositoryId: null,
          forwardedRepo: returnsRepo.id,
        },
      });
    }
    // if (type === "repository") {
    //   await prisma.order.updateMany({
    //     where: {
    //       id: {
    //         in: ordersIDs,
    //       },
    //     },
    //     data: {
    //       secondaryStatus: "IN_CAR",
    //       repositoryId: repositoryId,
    //       forwardedRepo: returnsRepo.id,
    //     },
    //   });
    // }
    // if (type === "company") {
    //   await prisma.order.updateMany({
    //     where: {
    //       id: {
    //         in: ordersIDs,
    //       },
    //     },
    //     data: {
    //       secondaryStatus: "WITH_AGENT",
    //       repositoryId: null,
    //       forwardedRepo: returnsRepo.id,
    //     },
    //   });
    // }
    const reportData = await reportsRepository.getReport({
      reportID: report.id,
    });

    if (!reportData) {
      throw new AppError("حدث خطأ اثناء عمل الكشف", 500);
    }

    await prisma.customerOutput.deleteMany({
      where: {
        AND: [
          {repositoryId: returnsRepo.id},
          type === "client" ? {storeId: storeId ? +storeId : null} : {},
          type === "client"
            ? {clientId: store ? +store.clientId : null}
            : type === "company"
            ? {companyId: companyId ? +companyId : null}
            : {targetRepositoryId: repositoryId},
        ],
      },
    });
    // Send notification to client if report type is client report
    if (type === "client") {
      await sendNotification({
        title: "تم انشاء كشف جديد",
        content: `تم انشاء كشف جديد برقم ${reportData?.id}`,
        userID: store?.clientId as number,
      });
    }

    // update orders timeline
    for (const order of orders) {
      if (!order) {
        continue;
      }
      await ordersRepository.updateOrderTimeline({
        orderID: order.id,
        data: {
          type: "REPORT_CREATE",
          date: reportData?.createdAt,
          old: null,
          new: {
            id: reportData?.id,
            type: reportData?.type as ReportType,
          },
          by: {
            id: loggedInUser.id,
            name: loggedInUser.name,
          },
          message: `تم انشاء كشف راجع ${localizeReportType(
            reportData?.type
          )} برقم ${reportData?.id}`,
        },
      });
    }

    // TODO
    const pdf = await generateReport(
      type === "client"
        ? "CLIENT"
        : type === "company"
        ? "COMPANY"
        : "REPOSITORY",
      reportData,
      orders
    );

    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    // Set headers for a PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");

    res.send(pdfBuffer);
  });

  // deleteOrderFromSavedData=catchAsync(async(req,res)=>{
  //     const {orderIds}=req.body

  //     await prisma.customerOutput.deleteMany({
  //         where:{
  //             orderId:
  //         }
  //     })

  //     res.status(200).json({
  //         status: "success",
  //     });
  // })
}
