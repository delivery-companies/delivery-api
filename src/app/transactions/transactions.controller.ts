import {prisma} from "../../database/db";
import {catchAsync} from "../../lib/catchAsync";
import type {loggedInUserType} from "../../types/user";
import {EmployeesRepository} from "../employees/employees.repository";
import {
  TransactionCreateSchema,
  TransactionUpdateSchema,
} from "./transactions.dto";
import {TransactionsRepository} from "./transactions.repository";

const transactionsRepository = new TransactionsRepository();
const employeesRepository = new EmployeesRepository();
export class TransactionsController {
  createTransaction = catchAsync(async (req, res) => {
    const transactionData = TransactionCreateSchema.parse(req.body);
    const loggedInUser = res.locals.user as loggedInUserType;
    const companyId = loggedInUser.companyID!!;
    transactionData.createdById = loggedInUser.id;

    const createdTransaction = await transactionsRepository.createTransaction(
      companyId,
      loggedInUser.branchId,
      transactionData
    );

    res.status(200).json({
      status: "success",
      data: createdTransaction,
    });
  });

  getEmployeesWallet = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const companyId = loggedInUser.companyID!!;

    let page = req.query.page ? +req.query.page : 1;
    let size = req.query.size ? +req.query.size : 10;

    const result = await transactionsRepository.getCompanyNetGroupedByCreatedBy(
      companyId,
      page,
      size
    );

    res.status(200).json({
      status: "success",
      page: result.page,
      pagesCount: result.pagesCount,
      totalGroups: result.totalGroups,
      data: result.data,
    });
  });

  getAllTransactions = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const {type, deliveryAgentId, clientId, start_date, end_date} = req.query;

    const companyId = loggedInUser.companyID!!;

    let size = req.query.size ? +req.query.size : 10;
    if (size > 500) size = 10;

    let page = 1;
    if (
      req.query.page &&
      !Number.isNaN(+req.query.page) &&
      +req.query.page > 0
    ) {
      page = +req.query.page;
    }

    const {
      transactions,
      pagesCount,
      count,
      totalDepoist,
      totalWithdraw,
      receivedFromAgents,
      notReceived,
      forClients,
      paidToClients,
      agentProfit,
      branchProfit,
    } = await transactionsRepository.getAllTransactionsPaginated({
      page,
      size,
      companyId,
      deliveryAgentId: deliveryAgentId ? +deliveryAgentId : undefined,
      clientId: clientId ? +clientId : undefined,
      branchId: loggedInUser.branchId,
      type: type?.toString(),
      start_date: start_date?.toString(),
      end_date: end_date?.toString(),
      loggedInUser,
    });

    res.status(200).json({
      status: "success",
      page,
      pagesCount,
      data: transactions,
      count,
      totalDepoist,
      totalWithdraw,
      total: totalDepoist - totalWithdraw,
      receivedFromAgents,
      notReceived,
      forClients,
      paidToClients,
      agentProfit,
      branchProfit,
    });
  });

  getReceivingAgent = catchAsync(async (req, res) => {
    const {receivingAgentId, start_date, end_date} = req.query;
    const loggedInUser = res.locals.user as loggedInUserType;

    let startDate = new Date();
    let endDate = new Date();

    const isMainRepository =
      loggedInUser?.mainRepository || loggedInUser?.role === "COMPANY_MANAGER";

    const mainBranch = await prisma.branch.findFirst({
      where: {
        companyId: loggedInUser.companyID!!,
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

    if (start_date) {
      startDate = new Date(start_date.toString());
      startDate.setUTCDate(startDate.getUTCDate() - 1);
      startDate.setHours(21, 0, 0, 0);
    }
    if (end_date) {
      endDate = new Date(end_date.toString());
      endDate.setHours(21, 0, 0, 0);
    }

    let inquiryClientsIDs: number[] | undefined = [];

    const inquiryEmployeeStuff =
      await employeesRepository.getInquiryEmployeeStuff({
        employeeID: +receivingAgentId!!,
      });

    inquiryClientsIDs =
      inquiryEmployeeStuff.inquiryClients &&
      inquiryEmployeeStuff.inquiryClients.length > 0
        ? inquiryEmployeeStuff.inquiryClients
        : [];

    const clients = await prisma.client.findMany({
      where: {
        id: {in: inquiryClientsIDs},
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

    const ordersCount = await prisma.order.groupBy({
      by: ["clientId"],
      _count: {
        id: true,
      },
      where: {
        AND: [
          {clientId: {in: inquiryClientsIDs}},
          {deleted: false},
          {confirmed: true},
          // Filter by startDate
          {
            createdAt: start_date
              ? {
                  gt: startDate,
                }
              : undefined,
          },
          // Filter by endDate
          {
            createdAt: end_date
              ? {
                  lt: endDate,
                }
              : undefined,
          },
        ],
      },
    });

    const deliveredOrdersCount = await prisma.order.groupBy({
      by: ["clientId"],
      _count: {
        id: true,
      },
      where: {
        AND: [
          {clientId: {in: inquiryClientsIDs}},
          {status: {in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"]}},
          {deleted: false},
          {confirmed: true},
          {
            createdAt: start_date
              ? {
                  gt: startDate,
                }
              : undefined,
          },
          // Filter by endDate
          {
            createdAt: end_date
              ? {
                  lt: endDate,
                }
              : undefined,
          },
        ],
      },
    });

    const forwardedReports = await prisma.branchReport.findMany({
      where: {
        branchId: isMainRepository ? undefined : loggedInUser.branchId,
        type: "forwarded",
      },
      include: {
        orders: {
          where: {
            AND: [
              {
                createdAt: start_date
                  ? {
                      gt: startDate,
                    }
                  : undefined,
              },
              // Filter by endDate
              {
                createdAt: end_date
                  ? {
                      lt: endDate,
                    }
                  : undefined,
              },
              {deleted: false},
              {clientId: {in: inquiryClientsIDs}},
            ],
          },
          select: {
            governorate: true,
            deliveryCost: true,
            clientId: true,
          },
        },
      },
    });

    const receivedReports = await prisma.branchReport.findMany({
      where: {
        branchId: isMainRepository ? undefined : loggedInUser.branchId,
        type: "received",
      },
      include: {
        orders: {
          where: {
            AND: [
              {
                createdAt: start_date
                  ? {
                      gt: startDate,
                    }
                  : undefined,
              },
              // Filter by endDate
              {
                createdAt: end_date
                  ? {
                      lt: endDate,
                    }
                  : undefined,
              },
              {deleted: false},
              {clientId: {in: inquiryClientsIDs}},
            ],
          },
          select: {
            governorate: true,
            deliveryAgentNet: true,
            clientId: true,
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

    const insideOrders = await prisma.order.groupBy({
      by: ["clientId"],
      _sum: {
        companyNet: true,
        clientNet: true,
      },
      where: {
        AND: [
          {
            createdAt: start_date
              ? {
                  gt: startDate,
                }
              : undefined,
          },
          // Filter by endDate
          {
            createdAt: end_date
              ? {
                  lt: endDate,
                }
              : undefined,
          },
          {deleted: false},
          {clientId: {in: inquiryClientsIDs}},
          {
            branch: {
              id: loggedInUser.branchId,
            },
          },
          {
            OR: [
              {deliveryAgentReport: {isNot: null}},
              {
                deliveryAgentReport: {
                  report: {deleted: true},
                },
              },
            ],
          },
        ],
      },
    });

    res.status(200).json({
      status: "success",
      data: clients.map((client) => {
        const count = ordersCount.find((c) => c.clientId === client.id)?._count
          .id;
        const count2 = deliveredOrdersCount.find(
          (c) => c.clientId === client.id
        )?._count.id;

        const profit = insideOrders.find((c) => c.clientId === client.id);

        let branchProfit = 0;

        branchProfit += profit?._sum.companyNet || 0;
        branchProfit -= profit?._sum.clientNet || 0;

        forwardedReports.forEach((report) => {
          const clientOrders = report.orders.filter(
            (o) => o.clientId === client.id
          );
          clientOrders.forEach((order) => {
            if (order.governorate === "BAGHDAD") {
              branchProfit += isMainRepository
                ? report.baghdadDeliveryCost
                : order.deliveryCost - report.baghdadDeliveryCost;
            } else {
              branchProfit += isMainRepository
                ? report.governoratesDeliveryCost
                : order.deliveryCost - report.governoratesDeliveryCost;
            }
          });
        });

        receivedReports.forEach((report) => {
          const clientOrders = report.orders.filter(
            (o) => o.clientId === client.id
          );
          clientOrders.forEach((order) => {
            if (order.client.branchId === mainBranch?.id && isMainRepository) {
              if (order.governorate === "BAGHDAD") {
                branchProfit += order.deliveryCost - report.baghdadDeliveryCost;
              } else {
                branchProfit +=
                  order.deliveryCost - report.governoratesDeliveryCost;
              }
            } else {
              if (order.governorate === "BAGHDAD") {
                branchProfit += isMainRepository
                  ? -report.baghdadDeliveryCost
                  : report.baghdadDeliveryCost - order.deliveryAgentNet;
              } else {
                branchProfit += isMainRepository
                  ? -report.governoratesDeliveryCost
                  : report.governoratesDeliveryCost - order.deliveryAgentNet;
              }
            }
          });
        });

        return {
          total: count,
          deliveredTotal: count2,
          name: client.user.name,
          branchProfit,
        };
      }),
    });
  });

  getTransaction = catchAsync(async (req, res) => {
    const transactionId = +req.params.transactionId;
    const transaction = await transactionsRepository.getTransaction({
      transactionId,
    });

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  });

  updateTransaction = catchAsync(async (req, res) => {
    const transactionId = +req.params.transactionId;
    const transactionData = TransactionUpdateSchema.parse(req.body);

    const updatedTransaction = await transactionsRepository.updateTransaction({
      transactionId,
      transactionData,
    });

    res.status(200).json({
      status: "success",
      data: updatedTransaction,
    });
  });

  deleteTransaction = catchAsync(async (req, res) => {
    const transactionId = +req.params.transactionId;
    await transactionsRepository.deleteTransaction({transactionId});

    res.status(200).json({
      status: "success",
    });
  });
}
