import {prisma} from "../../database/db";
import {catchAsync} from "../../lib/catchAsync";
import type {loggedInUserType} from "../../types/user";
import {
  OrderChatNotificationCreateSchema,
  OrderCreateSchema,
  type OrderCreateType,
  OrderRepositoryConfirmByReceiptNumberSchema,
  OrderTimelineFiltersSchema,
  OrderUpdateSchema,
  OrdersFiltersSchema,
  OrdersReceiptsCreateSchema,
  OrdersReportPDFCreateSchema,
  OrdersStatisticsFiltersSchema,
} from "./orders.dto";
import {OrdersService} from "./orders.service";
import {EmployeesRepository} from "../employees/employees.repository";
import {Governorate, OrderStatus, SecondaryStatus} from "@prisma/client";
import {orderReform, orderSelect, OrderStatusData} from "./orders.responses";
import {AppError} from "../../lib/AppError";
import {OrdersRepository} from "./orders.repository";
import {generateReceipts} from "./helpers/generateReceipts";
import {governorateArabicNames} from "../locations/locations.repository";
const XlsxPopulate = require("xlsx-populate");

const employeesRepository = new EmployeesRepository();

const ordersService = new OrdersService();

const ordersRepository = new OrdersRepository();

export class OrdersController {
  createOrder = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    let orderOrOrders: OrderCreateType | OrderCreateType[];
    if (Array.isArray(req.body)) {
      orderOrOrders = req.body.map((order) => OrderCreateSchema.parse(order));
    } else {
      orderOrOrders = OrderCreateSchema.parse(req.body);
    }

    const createdOrderOrOrders = await ordersService.createOrder({
      loggedInUser: loggedInUser,
      orderOrOrdersData: orderOrOrders,
    });

    res.status(200).json({
      status: "success",
      data: createdOrderOrOrders,
    });
  });

  getAllOrders = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const filters = OrdersFiltersSchema.parse({
      clientID: req.query.client_id,
      deliveryAgentID: req.query.delivery_agent_id,
      companyID: req.query.company_id,
      automaticUpdateID: req.query.automatic_update_id,
      search: req.query.search,
      sort: req.query.sort,
      page: req.query.page,
      size: req.query.size,
      confirmed: req.query.confirmed,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      startDeliveryDate: req.query.delivery_start_date,
      endDeliveryDate: req.query.delivery_end_date,
      deliveryDate: req.query.delivery_date,
      governorate: req.query.governorate,
      statuses: req.query.statuses,
      status: req.query.status,
      deliveryType: req.query.delivery_type,
      storeID: req.query.store_id,
      repositoryID: req.query.repository_id,
      branchID: req.query.branch_id,
      productID: req.query.product_id,
      locationID: req.query.location_id,
      receiptNumber: req.query.receipt_number,
      receiptNumbers: req.query.receipt_numbers,
      recipientName: req.query.recipient_name,
      recipientPhone: req.query.recipient_phone,
      recipientAddress: req.query.recipient_address,
      clientReport: req.query.client_report,
      repositoryReport: req.query.repository_report,
      branchReport: req.query.branch_report,
      deliveryAgentReport: req.query.delivery_agent_report,
      governorateReport: req.query.governorate_report,
      companyReport: req.query.company_report,
      notes: req.query.notes,
      deleted: req.query.deleted,
      orderID: req.query.order_id,
      minified: req.query.minified,
      forMobile: req.query.for_mobile,
      forwarded: req.query.forwarded,
      forwardedByID: req.query.forwarded_by_id,
      forwardedFromID: req.query.forwarded_from_id,
      processed: req.query.processed,
      processingStatus: req.query.processingStatus,
      secondaryStatus: req.query.secondaryStatus,
      clientOrderReceiptId: req.query.clientOrderReceiptId,
      printed: req.query.printed,
      delivered: req.query.delivered,
      orderType: req.query.orderType,
    });

    const {orders, ordersMetaData, page, pagesCount} =
      await ordersService.getAllOrders({
        loggedInUser: loggedInUser,
        filters: filters,
      });

    res.status(200).json({
      status: "success",
      page: page,
      pagesCount: pagesCount,
      data: {
        ordersMetaData: ordersMetaData,
        orders: orders,
      },
    });
  });

  getRepositoryOrders = catchAsync(async (req, res) => {
    const {
      client_id,
      size,
      page,
      store_id,
      repository_id,
      to_repository_id,
      governorate,
      secondaryStatus,
      status,
      getIncoming,
      getOutComing,
      branchId,
    } = req.query;

    const loggedInUser = res.locals.user as loggedInUserType;

    const user = await prisma.employee.findUnique({
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

    const exportRepo = user?.branch?.repositories.find(
      (repo) => repo.type === "EXPORT"
    );
    const returnRepo = user?.branch?.repositories.find(
      (repo) => repo.type === "RETURN"
    );

    if (!user) {
      throw new AppError("حسابك غير موجود", 404);
    }

    if (!exportRepo && status !== "RETURNED") {
      throw new AppError("لا يوجد مخزن وارد للفرع الخاص بك ", 404);
    }

    if (!returnRepo && status === "RETURNED") {
      throw new AppError("لا يوجد مخزن راوجع للفرع الخاص بك ", 404);
    }

    if (
      (loggedInUser.role === "BRANCH_MANAGER" &&
        !repository_id &&
        getIncoming) ||
      (loggedInUser.role === "BRANCH_MANAGER" && !repository_id && getOutComing)
    ) {
      throw res.status(200).json({
        status: "success",
        data: {
          count: 0,
          pageCount: 0,
          currentPage: 0,
          orders: [],
        },
      });
    }

    const results = await prisma.order.findManyPaginated(
      {
        where: {
          deleted: false,
          repositoryId:
            getOutComing && to_repository_id
              ? Number(to_repository_id)
              : getOutComing
              ? undefined
              : repository_id
              ? Number(repository_id)
              : secondaryStatus === "IN_CAR"
              ? undefined
              : status === "RETURNED"
              ? returnRepo?.id
              : exportRepo?.id,
          secondaryStatus: secondaryStatus as SecondaryStatus,
          status:
            status === "RETURNED"
              ? {in: ["RETURNED", "PARTIALLY_RETURNED", "REPLACED"]}
              : (status as OrderStatus),
          storeId: store_id ? Number(store_id) : undefined,
          clientId: client_id ? Number(client_id) : undefined,
          governorate: governorate ? (governorate as Governorate) : undefined,
          forwardedBranchId: getIncoming && branchId ? +branchId : undefined,
          branchId: !getIncoming && branchId ? +branchId : undefined,
          forwardedRepo: getOutComing
            ? returnRepo?.id
            : getIncoming && to_repository_id
            ? Number(to_repository_id)
            : getIncoming
            ? undefined
            : secondaryStatus === "IN_CAR"
            ? exportRepo?.id
            : undefined,
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: orderSelect,
      },
      {
        page: page ? +page : 1,
        size: size ? +size : 10,
      }
    );

    const newData = results.data.map((order) => orderReform(order));

    res.status(200).json({
      status: "success",
      pagesCount: results.pagesCount,
      data: {
        count: results.dataCount,
        pageCount: results.pagesCount,
        currentPage: results.currentPage,
        orders: newData,
      },
    });
  });

  getOrder = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    const order = await ordersService.getOrder({
      params: params,
    });
    const orderTimeline = await ordersService.getOrderTimeline({
      params: {orderID: params.orderID},
      filters: {},
    });
    const orderInquiryEmployees = await ordersService.getOrderInquiryEmployees({
      params: params,
    });

    res.status(200).json({
      status: "success",
      data: order,
      orderTimeline,
      orderInquiryEmployees,
    });
  });

  getOrderById = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    const order = await ordersService.getOrderById({
      params: params,
    });
    const orderTimeline = await ordersService.getOrderTimeline({
      params: {orderID: params.orderID},
      filters: {},
    });
    const orderInquiryEmployees = await ordersService.getOrderInquiryEmployees({
      params: params,
    });

    res.status(200).json({
      status: "success",
      data: order,
      orderTimeline,
      orderInquiryEmployees,
    });
  });

  updateOrder = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };
    const loggedInUser = res.locals.user as loggedInUserType;
    const orderData = OrderUpdateSchema.parse(req.body);

    const order = await ordersService.updateOrder({
      params: params,
      orderData: orderData,
      loggedInUser: loggedInUser,
    });

    res.status(200).json({
      status: "success",
      data: order,
    });
  });

  sendOrdersToReceivingAgent = catchAsync(async (req, res) => {
    const ordersIDs = OrdersReceiptsCreateSchema.parse(req.body);
    const loggedInUser = res.locals.user as loggedInUserType;

    if (loggedInUser.role === "CLIENT" && ordersIDs.selectedAll === true) {
      const count = await prisma.order.count({
        where: {
          status: "REGISTERED",
          deleted: false,
          printed: false,
          client: {
            id: loggedInUser.id,
          },
        },
      });
      if (count > 0) {
        throw new AppError("تأكد من طباعه جميع الوصلات", 404);
      }
      await prisma.order.updateMany({
        data: {
          status: "READY_TO_SEND",
        },
        where: {
          status: "REGISTERED",
          deleted: false,
          client: {
            id: loggedInUser.id,
          },
        },
      });
      res.status(200).json({
        status: "success",
      });
    } else {
      const count = await prisma.order.count({
        where: {
          status: "REGISTERED",
          deleted: false,
          printed: false,
          id: {
            in: ordersIDs.ordersIDs,
          },
          client: {
            id: loggedInUser.id,
          },
        },
      });
      if (count > 0) {
        throw new AppError("تأكد من طباعه جميع الوصلات", 404);
      }
      await prisma.order.updateMany({
        data: {
          status: "READY_TO_SEND",
        },
        where: {
          status: "REGISTERED",
          deleted: false,
          client: {
            id:
              loggedInUser.role === "CLIENT"
                ? loggedInUser.id
                : loggedInUser.clientId,
          },
          id: {
            in: ordersIDs.ordersIDs,
          },
        },
      });
      res.status(200).json({
        status: "success",
      });
    }
  });

  addOrderToRepository = catchAsync(async (req, res) => {
    const params = {
      orderReceiptNumber: req.params.orderID,
    };
    const loggedInUser = res.locals.user as loggedInUserType;

    const orderData = OrderUpdateSchema.parse(req.body);

    const user = await prisma.employee.findUnique({
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

    const exportRepo = user?.branch?.repositories.find(
      (repo) => repo.type === "EXPORT"
    );

    if (!user) {
      throw new AppError("حسابك غير موجود", 404);
    }

    if (!exportRepo) {
      throw new AppError("لا يوجد مخزن وارد لهذا الفرع!", 404);
    }

    let oldOrder = await ordersRepository.getOrderByReceiptNumber({
      orderReceiptNumber: params.orderReceiptNumber,
    });

    if (!oldOrder) {
      oldOrder = await ordersRepository.getOrder({
        orderID: params.orderReceiptNumber,
      });
      if (!oldOrder) {
        throw new AppError("الطلب غير موجود", 404);
      }
    }

    if (orderData.secondaryStatus === "IN_CAR") {
      if (exportRepo?.mainRepository) {
        const repository = await prisma.repository.findFirst({
          where: {
            id: orderData.repositoryID,
          },
          select: {
            branchId: true,
            branch: {
              select: {
                governorate: true,
              },
            },
          },
        });

        if (repository?.branch.governorate !== oldOrder?.governorate) {
          throw new AppError("الطلب غير مرتبط بهذا الفرع", 400);
        }
        if (repository.branchId === oldOrder.client.branchId) {
          orderData.forwardedBranchId = -1;
        } else {
          orderData.receivedBranchId = repository?.branchId;
        }
        orderData.forwardedRepo = exportRepo?.id;
        orderData.branchID = repository.branchId;
      } else {
        const mainRepository = await prisma.repository.findFirst({
          where: {
            mainRepository: true,
            company: loggedInUser.companyID
              ? {
                  id: loggedInUser.companyID,
                }
              : undefined,
            type: "EXPORT",
          },
          select: {
            id: true,
          },
        });
        orderData.repositoryID = mainRepository?.id;
        orderData.forwardedRepo = exportRepo?.id;
        orderData.forwardedBranchId = user.branch?.id;
      }
    } else {
      if (user.branch?.id !== oldOrder.client.branchId) {
        orderData.forwardedBranchId = oldOrder.client.branchId || undefined;
      }
      if (
        oldOrder.receivedBranchId &&
        oldOrder.receivedBranchId !== user.branch?.id
      ) {
        orderData.receivedBranchId = user.branch?.id;
      }
      orderData.repositoryID = exportRepo?.id;
      orderData.branchID = user.branch?.id;
    }

    if (
      oldOrder?.status === "RETURNED" ||
      oldOrder?.status === "REPLACED" ||
      oldOrder?.status === "PARTIALLY_RETURNED"
    ) {
      throw new AppError("هذا الطلب مرتجع!", 400);
    }

    orderData.confirmed = true;

    const order = await ordersService.updateOrder({
      params: {
        orderID: oldOrder?.id,
      },
      orderData: orderData,
      loggedInUser: loggedInUser,
    });

    res.status(200).json({
      status: "success",
      data: order,
    });
  });

  addReturnedOrderToRepository = catchAsync(async (req, res) => {
    const params = {
      orderReceiptNumber: req.params.orderID,
    };
    const loggedInUser = res.locals.user as loggedInUserType;

    const orderData = OrderUpdateSchema.parse(req.body);

    const user = await prisma.employee.findUnique({
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

    const returnsRepo = user?.branch?.repositories.find(
      (repo) => repo.type === "RETURN"
    );

    if (!user) {
      throw new AppError("حسابك غير موجود", 404);
    }

    if (!returnsRepo) {
      throw new AppError("لا يوجد مخزن راوجع لهذا الفرع!", 404);
    }

    let oldOrder = await ordersRepository.getOrderByReceiptNumber({
      orderReceiptNumber: params.orderReceiptNumber,
    });

    if (!oldOrder) {
      oldOrder = await ordersRepository.getOrder({
        orderID: params.orderReceiptNumber,
      });
      if (!oldOrder) {
        throw new AppError("الطلب غير موجود", 404);
      }
    }

    if (!orderData.repositoryID) {
      orderData.repositoryID = returnsRepo?.id;
    }

    if (
      oldOrder?.status !== "RETURNED" &&
      oldOrder?.status !== "REPLACED" &&
      oldOrder?.status !== "PARTIALLY_RETURNED"
    ) {
      throw new AppError("هذا الطلب غير مرتجع!", 400);
    }

    if (
      oldOrder.secondaryStatus === "IN_REPOSITORY" &&
      oldOrder.repository?.id === returnsRepo?.id
    ) {
      throw new AppError("هذا الطلب موجود في مخزن!", 400);
    }
    const returnedReport = oldOrder.repositoryReport.find(
      (r) => r.secondaryType === "RETURNED"
    );
    // // Remove the order from the repository report
    // if (returnedReport) {
    //   await ordersRepository.removeOrderFromRepositoryReport({
    //     orderID: oldOrder.id,
    //     repositoryReportID: returnedReport.id,
    //     orderData: {
    //       totalCost: oldOrder.totalCost,
    //       paidAmount: oldOrder.paidAmount,
    //       deliveryCost: oldOrder.deliveryCost,
    //       clientNet: oldOrder.clientNet,
    //       deliveryAgentNet: oldOrder.deliveryAgentNet,
    //       companyNet: oldOrder.companyNet,
    //       governorate: oldOrder.governorate,
    //     },
    //   });
    // }

    const customerOutput = await prisma.customerOutput.deleteMany({
      where: {
        orderId: oldOrder.id,
        targetRepositoryId: returnedReport?.id,
      },
    });

    const order = await ordersService.updateOrder({
      params: {
        orderID: oldOrder.id,
      },
      orderData: orderData,
      loggedInUser: loggedInUser,
    });

    res.status(200).json({
      status: "success",
      data: order,
    });
  });

  repositoryConfirmOrderByReceiptNumber = catchAsync(async (req, res) => {
    const params = {
      orderReceiptNumber: req.params.orderReceiptNumber,
    };
    const loggedInUser = res.locals.user as loggedInUserType;
    const orderData = OrderRepositoryConfirmByReceiptNumberSchema.parse(
      req.body
    );

    const order = await ordersService.repositoryConfirmOrderByReceiptNumber({
      params: params,
      orderData: orderData,
      loggedInUser: loggedInUser,
    });

    res.status(200).json({
      status: "success",
      data: order,
    });
  });

  deleteOrder = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    await ordersService.deleteOrder({
      params: params,
    });

    res.status(200).json({
      status: "success",
    });
  });

  createOrdersReceipts = catchAsync(async (req, res) => {
    const ordersIDs = OrdersReceiptsCreateSchema.parse(req.body);
    const loggedInUser = res.locals.user as loggedInUserType;

    const pdf = await ordersService.createOrdersReceipts({
      ordersIDs,
      loggedInUser: loggedInUser,
    });
    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    // Set headers for a PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");

    res.send(pdfBuffer);
  });

  getOrderPdf = catchAsync(async (req, res) => {
    const pdfId = req.params.id;

    const orders = await prisma.order.findMany({
      where: {
        pdfId: +pdfId,
      },
      orderBy: {
        id: "asc",
      },
      select: orderSelect,
    });

    const reformedOrders = orders.map(orderReform);

    const pdf = await generateReceipts(reformedOrders);

    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    // Set headers for a PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");

    res.send(pdfBuffer);
  });

  getPdfs = catchAsync(async (req, res) => {
    const {page, size} = req.query;
    const loggedInUser = res.locals.user as loggedInUserType;
    const pdfs = await prisma.savedPdf.findManyPaginated(
      {
        where: {
          clientId:
            loggedInUser.role === "CLIENT"
              ? loggedInUser.id
              : loggedInUser.clientId,
        },
        select: {
          id: true,
          ordersCount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      {
        page: page ? +page : 1,
        size: size ? +size : 2000,
      }
    );

    res.status(200).json({
      status: "success",
      page: pdfs.currentPage,
      pagesCount: pdfs.pagesCount,
      data: {
        pdfs: pdfs,
      },
    });
  });

  getOrdersReportPDF = catchAsync(async (req, res) => {
    const ordersData = OrdersReportPDFCreateSchema.parse(req.body);

    const filters = OrdersFiltersSchema.parse({
      confirmed: req.query.confirmed,
      clientID: req.query.client_id,
      deliveryAgentID: req.query.delivery_agent_id,
      companyID: req.query.company_id,
      sort: "receiptNumber:asc",
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      startDeliveryDate: req.query.delivery_start_date,
      endDeliveryDate: req.query.delivery_end_date,
      governorate: req.query.governorate,
      statuses: req.query.statuses,
      status: req.query.status,
      deliveryType: req.query.delivery_type,
      storeID: req.query.store_id,
      repositoryID: req.query.repository_id,
      branchID: req.query.branch_id,
      clientReport: req.query.client_report,
      repositoryReport: req.query.repository_report,
      branchReport: req.query.branch_report,
      deliveryAgentReport: req.query.delivery_agent_report,
      governorateReport: req.query.governorate_report,
      companyReport: req.query.company_report,
      minified: false,
    });

    const pdf = await ordersService.getOrdersReportPDF({
      ordersData: ordersData,
      ordersFilters: filters,
    });

    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    // Set headers for a PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");

    res.send(pdfBuffer);
  });

  getOrdersStatistics = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const filters = OrdersStatisticsFiltersSchema.parse({
      clientID: req.query.client_id,
      deliveryAgentID: req.query.delivery_agent_id,
      companyID: req.query.company_id,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      governorate: req.query.governorate,
      statuses: req.query.statuses,
      deliveryType: req.query.delivery_type,
      storeID: req.query.store_id,
      locationID: req.query.location_id,
      clientReport: req.query.client_report,
      repositoryReport: req.query.repository_report,
      branchReport: req.query.branch_report,
      deliveryAgentReport: req.query.delivery_agent_report,
      governorateReport: req.query.governorate_report,
      companyReport: req.query.company_report,
      orderType: req.query.orderType,
    });

    const statistics = await ordersService.getOrdersStatistics({
      loggedInUser: loggedInUser,
      filters: filters,
    });

    res.status(200).json({
      status: "success",
      data: statistics,
    });
  });

  getRepositorOrdersStatistics = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const type = req.query.type;

    const user = await prisma.employee.findUnique({
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

    const exportRepo = user?.branch?.repositories.find(
      (repo) => repo.type === "EXPORT"
    );
    const branchs = await prisma.branch.findMany({
      where: {
        companyId: loggedInUser.companyID!!,
      },
      select: {
        id: true,
        name: true,
        repositories: {
          select: {
            id: true,
          },
        },
      },
    });
    const deliveries = await prisma.employee.findMany({
      where: {
        companyId: loggedInUser.companyID!!,
        branchId: loggedInUser.branchId,
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    if (type === "forwarded") {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["branchId"],
        _count: {
          id: true,
        },
        where: {
          deleted: false,
          secondaryStatus: "IN_CAR",
          forwardedRepo: exportRepo?.id,
        },
      });
      res.status(200).json({
        status: "success",
        data: ordersStatisticsByStatus.map((status) => {
          return {
            count: status._count.id,
            branchId: status.branchId,
            branchName: branchs.find(
              (branch) => +branch.id === +status.branchId!!
            )?.name,
          };
        }),
      });
    } else if (type === "WITH_RECEIVING_AGENT") {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["deliveryAgentId"],
        _count: {
          id: true,
        },
        where: {
          deleted: false,
          status: "WITH_RECEIVING_AGENT",
          deliveryAgent: {
            branchId: loggedInUser.branchId,
          },
        },
      });
      res.status(200).json({
        status: "success",
        data: ordersStatisticsByStatus.map((status) => {
          return {
            count: status._count.id,
            deliveryAgentId: status.deliveryAgentId,
            name: deliveries.find(
              (branch) => +branch.id === +status.deliveryAgentId!!
            )?.user.name,
          };
        }),
      });
    } else if (type === "inrepo") {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["governorate"],
        _count: {
          id: true,
        },
        where: {
          deleted: false,
          secondaryStatus: "IN_REPOSITORY",
          repositoryId: exportRepo?.id,
        },
      });
      res.status(200).json({
        status: "success",
        data: ordersStatisticsByStatus.map((status) => {
          return {
            count: status._count.id,
            governorate: status.governorate,
            governorateName: governorateArabicNames[status.governorate],
          };
        }),
      });
    } else {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["forwardedBranchId"],
        _count: {
          id: true,
        },
        where: {
          deleted: false,
          secondaryStatus: "IN_CAR",
          repositoryId: exportRepo?.id,
        },
      });
      res.status(200).json({
        status: "success",
        data: ordersStatisticsByStatus.map((status) => {
          return {
            count: status._count.id,
            branchId: status.forwardedBranchId,
            branchName: branchs.find(
              (branch) => +branch.id === +status.forwardedBranchId!!
            )?.name,
          };
        }),
      });
    }
  });

  getCLientOrdersStatistics = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const status = req.query.status;

    let inquiryClientsIDs: number[] | undefined = undefined;
    const inquiryEmployeeStuff =
      await employeesRepository.getInquiryEmployeeStuff({
        employeeID: loggedInUser.id,
      });

    inquiryClientsIDs =
      inquiryEmployeeStuff.inquiryClients &&
      inquiryEmployeeStuff.inquiryClients.length > 0
        ? inquiryEmployeeStuff.inquiryClients
        : undefined;

    const clients = await prisma.client.findMany({
      where: {
        companyId: loggedInUser.companyID!,
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const ordersStatisticsByStatus = await prisma.order.groupBy({
      by: ["clientId"],
      _count: {
        id: true,
      },
      where: {
        deleted: false,
        status:
          status === "RETURNED"
            ? {in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"]}
            : (status as OrderStatus),
        clientReport:
          status === "RETURNED"
            ? {
                some: {
                  receivingAgentId: loggedInUser.id,
                  report: {
                    confirmed: false,
                    deleted: false,
                  },
                },
              }
            : undefined,
        client:
          status === "RETURNED"
            ? undefined
            : {
                id: {
                  in: inquiryClientsIDs,
                },
              },
      },
    });

    res.status(200).json({
      status: "success",
      data: ordersStatisticsByStatus.map((status) => {
        return {
          count: status._count.id,
          clientId: status.clientId,
          clientName: clients.find((client) => +client.id === +status.clientId)
            ?.user.name,
        };
      }),
    });
  });

  getReceivingAgentStores = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const {receivingAgentId, clientId} = req.query;

    let inquiryClientsIDs: number[] | undefined = undefined;

    if (receivingAgentId) {
      const inquiryEmployeeStuff =
        await employeesRepository.getInquiryEmployeeStuff({
          employeeID: +receivingAgentId!!,
        });

      inquiryClientsIDs =
        inquiryEmployeeStuff.inquiryClients &&
        inquiryEmployeeStuff.inquiryClients.length > 0
          ? inquiryEmployeeStuff.inquiryClients
          : undefined;
    }

    // aggregate orders for these clients
    const aggregatedOrders = await prisma.order.groupBy({
      by: ["storeId"],
      where: {
        AND: [
          {clientId: clientId ? +clientId : {in: inquiryClientsIDs}},
          {status: {in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"]}},
          {
            deleted: false,
          },
          {
            confirmed: true,
          },
          {
            companyId: loggedInUser.companyID!!,
          },
          {
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
        ],
      },
      _count: {id: true},
      _sum: {
        totalCost: true,
        paidAmount: true,
        clientNet: true,
        deliveryAgentNet: true,
        companyNet: true,
        deliveryCost: true,
      },
    });

    const stores = await prisma.store.findMany({
      where: {
        id: receivingAgentId
          ? {in: aggregatedOrders.map((o) => o.storeId)}
          : undefined,
        clientId: clientId ? +clientId : undefined,
      },
      select: {
        id: true,
        name: true,
        client: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // merge data
    const result = aggregatedOrders.map((o) => {
      const store = stores.find((s) => s.id === o.storeId);
      return {
        store: {
          id: o.storeId,
          name: store?.name || "",
        },
        client: {
          id: store?.client.user.id,
          name: store?.client.user.name,
        },
        count: o._count.id,
        totalCost: o._sum.totalCost || 0,
        paidAmount: o._sum.paidAmount || 0,
        clientNet: o._sum.clientNet || 0,
        deliveryAgentNet: o._sum.deliveryAgentNet || 0,
        companyNet: o._sum.companyNet || 0,
        deliveryCost: o._sum.deliveryCost || 0,
      };
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  getStatusOrdersStatistics = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const status = req.query.status as OrderStatus;

    if (status === "REGISTERED") {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        _sum: {
          totalCost: true,
        },
        where: {
          clientId: loggedInUser.id,
          deleted: false,
          status: {in: ["REGISTERED", "READY_TO_SEND"]},
        },
      });

      const statuses: OrderStatus[] = ["REGISTERED", "READY_TO_SEND"];
      res.status(200).json({
        status: "success",
        data: statuses.map((status) => {
          const statuscount = ordersStatisticsByStatus.find(
            (s) => s.status === status
          );

          return {
            status: status,
            count: statuscount?._count.id || 0,
            totalCost: statuscount?._sum.totalCost || 0,
            name: OrderStatusData[status].name,
            icon: OrderStatusData[status].icon,
          };
        }),
      });
    } else if (status === "WITH_RECEIVING_AGENT") {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        _sum: {
          totalCost: true,
        },
        where: {
          clientId: loggedInUser.id,
          deleted: false,
          status: {
            in: [
              "WITH_RECEIVING_AGENT",
              "IN_MAIN_REPOSITORY",
              "IN_GOV_REPOSITORY",
            ],
          },
        },
      });
      const statuses: OrderStatus[] = [
        "WITH_RECEIVING_AGENT",
        "IN_MAIN_REPOSITORY",
        "IN_GOV_REPOSITORY",
      ];
      res.status(200).json({
        status: "success",
        data: statuses.map((status) => {
          const statuscount = ordersStatisticsByStatus.find(
            (s) => s.status === status
          );

          return {
            status: status,
            count: statuscount?._count.id || 0,
            totalCost: statuscount?._sum.totalCost || 0,
            name: OrderStatusData[status].name,
            icon: OrderStatusData[status].icon,
          };
        }),
      });
    } else if (status === "DELIVERED") {
      const ordersStatisticsByStatus = await prisma.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        _sum: {
          totalCost: true,
        },
        where: {
          clientId: loggedInUser.id,
          deleted: false,
          status: {
            in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"],
          },
          OR: [
            {
              clientReport: {
                none: {
                  secondaryType: "DELIVERED",
                  report: {
                    confirmed: true,
                  },
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
                  report: {
                    confirmed: true,
                  },
                },
              },
              status: {
                in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"],
              },
            },
          ],
        },
      });
      const statuses: OrderStatus[] = [
        "DELIVERED",
        "PARTIALLY_RETURNED",
        "REPLACED",
      ];
      res.status(200).json({
        status: "success",
        data: statuses.map((status) => {
          const statuscount = ordersStatisticsByStatus.find(
            (s) => s.status === status
          );

          return {
            status: status,
            count: statuscount?._count.id || 0,
            totalCost: statuscount?._sum.totalCost || 0,
            name: OrderStatusData[status].name,
            icon: OrderStatusData[status].icon,
          };
        }),
      });
    }
  });

  getOrderTimeline = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    const filters = OrderTimelineFiltersSchema.parse({
      type: req.query.type,
      types: req.query.types,
    });

    const orderTimeline = await ordersService.getOrderTimeline({
      params: params,
      filters: filters,
    });

    res.status(200).json({
      status: "success",
      data: orderTimeline,
    });
  });

  getOrderChatMembers = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    const orderChatMembers = await ordersService.getOrderChatMembers({
      params: params,
    });

    res.status(200).json({
      status: "success",
      data: orderChatMembers,
    });
  });

  getOrderInquiryEmployees = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    const orderInquiryEmployees = await ordersService.getOrderInquiryEmployees({
      params: params,
    });

    res.status(200).json({
      status: "success",
      data: orderInquiryEmployees,
    });
  });

  deactivateOrder = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };
    const loggedInUser = res.locals.user as loggedInUserType;

    await ordersService.deactivateOrder({
      params: params,
      loggedInUser: loggedInUser,
    });

    res.status(200).json({
      status: "success",
    });
  });

  reactivateOrder = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };

    await ordersService.reactivateOrder({
      params: params,
    });

    res.status(200).json({
      status: "success",
    });
  });

  sendNotificationToOrderChatMembers = catchAsync(async (req, res) => {
    const params = {
      orderID: req.params.orderID,
    };
    const loggedInUser = res.locals.user as loggedInUserType;
    const notificationData = OrderChatNotificationCreateSchema.parse(req.body);

    await ordersService.sendNotificationToOrderChatMembers({
      params: params,
      loggedInUser: loggedInUser,
      notificationData: notificationData,
    });

    res.status(200).json({
      status: "success",
    });
  });

  generateExcelSheet = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as {companyID: number};

    // إنشاء ملف جديد
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0).name("Template");
    const listSheet = workbook.addSheet("Lists");

    // جلب البيانات من DB
    const locations = await prisma.location.findMany({
      where: {companyId: loggedInUser.companyID},
      select: {id: true, name: true, governorateAr: true},
    });

    // استخراج المحافظات الفريدة
    const governorates = Array.from(
      new Set(locations.map((l) => l.governorateAr?.trim()).filter(Boolean))
    );

    // تجميع المناطق حسب المحافظة
    const grouped: {[key: string]: string[]} = {};
    governorates.forEach((gov) => {
      grouped[gov!!] = locations
        .filter((l) => l.governorateAr?.trim() === gov)
        .map((l) => l.name);
    });

    // إضافة المحافظات للـ Lists sheet
    governorates.forEach((gov, i) => {
      listSheet.cell(`A${i + 1}`).value(gov);
    });
    workbook.definedName(
      "Governorates",
      `Lists!$A$1:$A$${governorates.length}`
    );

    // إضافة المناطق لكل محافظة
    let col = 2; // B, C, D...
    for (let gov of governorates) {
      const govSafe = gov.replace(/\s/g, "_");
      const locationList = grouped[gov] || [];

      locationList.forEach((loc, i) => {
        listSheet.cell(i + 1, col).value(loc);
      });

      const colLetter = String.fromCharCode(65 + col - 1);
      const endRow = locationList.length || 1;

      workbook.definedName(
        govSafe,
        `Lists!$${colLetter}$1:$${colLetter}$${endRow}`
      );

      col++;
    }

    listSheet.hidden(true);

    // إعداد الأعمدة
    sheet.cell("A1").value("رقم الهاتف");
    sheet.column("A").width(15);

    sheet.cell("B1").value("المحافظة");
    sheet.column("B").width(20);

    sheet.cell("C1").value("المنطقة");
    sheet.column("C").width(20);

    sheet.cell("D1").value("العنوان");
    sheet.column("D").width(30);

    sheet.cell("E1").value("المبلغ الكلي");
    sheet.column("E").width(15);

    sheet.cell("F1").value("الملاحظات");
    sheet.column("F").width(25);

    // عمل Data Validation
    for (let row = 2; row <= 1000; row++) {
      // المحافظة
      sheet.cell(`B${row}`).dataValidation({
        type: "list",
        formula1: "=Governorates",
        allowBlank: true,
        showErrorMessage: true,
        showInputMessage: true,
        promptTitle: "اختر المحافظة",
        prompt: "اختر المحافظة من القائمة",
      });

      // // المنطقة (تتغير حسب المحافظة المختارة)
      // sheet.cell(`C${row}`).dataValidation({
      //   type: "list",
      //   formula1: `=INDIRECT(SUBSTITUTE(B${row}," ","_"))`,
      //   allowBlank: true,
      //   showErrorMessage: true,
      //   showInputMessage: true,
      //   promptTitle: "اختر المنطقة",
      //   prompt: "اختر المنطقة من القائمة",
      // });

      // صيغة رقم للمبلغ
      sheet.cell(`E${row}`).style("numberFormat", "#,##0");
    }

    // كتابة وإرسال الملف
    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=template.xlsx");
    res.send(Buffer.from(buffer));
  });
}
