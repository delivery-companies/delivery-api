import {TransactionType} from "@prisma/client";
import {prisma} from "../../database/db";
import type {
  TransactionCreateType,
  TransactionUpdateType,
} from "./transactions.dto";
import {transactionSelect} from "./transactions.responses";

export class TransactionsRepository {
  async createTransaction(
    companyId: number | undefined,
    data: TransactionCreateType
  ) {
    if (!companyId) {
      throw new Error("companyId is required to create a transaction");
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        paidAmount: data.paidAmount,
        for: data.for,
        employeeId: data.employeeId ?? null,
        createdById: data.createdById ?? null,
        companyId,
      },
      select: transactionSelect,
    });

    return transaction;
  }

  async getAllTransactionsPaginated(filters: {
    page: number;
    size: number;
    companyId?: number;
    employeeId?: number;
    type?: TransactionType;
  }) {
    const where = {
      companyId: filters.companyId,
      createdById: filters.employeeId,
      type: filters.type ? filters.type : undefined,
    };

    const receivedFromAgents = await prisma.report.aggregate({
      _sum: {
        companyNet: true,
      },
      _count: {
        id: true,
      },
      where: {
        companyId: filters.companyId,
        type: "DELIVERY_AGENT",
      },
    });

    const notReceived = await prisma.order.aggregate({
      _sum: {
        paidAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        companyId: filters.companyId,
        deleted: false,
        status: {in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"]},
        OR: [
          {deliveryAgentReport: {is: null}},
          {
            deliveryAgentReport: {
              report: {deleted: true},
            },
          },
        ],
      },
    });

    const forClients = await prisma.order.aggregate({
      _sum: {
        clientNet: true,
      },
      _count: {
        id: true,
      },
      where: {
        companyId: filters.companyId,
        deleted: false,
        status: {in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"]},
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

    const paidToClients = await prisma.order.aggregate({
      _sum: {
        clientNet: true,
      },
      _count: {
        id: true,
      },
      where: {
        companyId: filters.companyId,
        deleted: false,
        status: {in: ["DELIVERED", "PARTIALLY_RETURNED", "REPLACED"]},
        clientReport: {
          some: {
            secondaryType: "DELIVERED",
            report: {
              deleted: false,
            },
          },
        },
      },
    });
    const totalDepoist = await prisma.transaction.aggregate({
      _sum: {
        paidAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        companyId: filters.companyId,
        type: "DEPOSIT",
      },
    });

    const totalWithdraw = await prisma.transaction.aggregate({
      _sum: {
        paidAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        companyId: filters.companyId,
        type: "WITHDRAW",
      },
    });
    const paginatedTransactions = await prisma.transaction.findManyPaginated(
      {
        where,
        orderBy: {
          createdAt: "desc",
        },
        select: transactionSelect,
      },
      {
        page: filters.page,
        size: filters.size,
      }
    );

    return {
      transactions: paginatedTransactions.data,
      pagesCount: paginatedTransactions.pagesCount,
      count: paginatedTransactions.dataCount,
      totalDepoist: totalDepoist._sum.paidAmount || 0,
      totalWithdraw: totalWithdraw._sum.paidAmount || 0,
      receivedFromAgents: receivedFromAgents._sum.companyNet,
      notReceived: notReceived._sum.paidAmount,
      forClients: forClients._sum.clientNet,
      paidToClients: paidToClients._sum.clientNet,
    };
  }

  async getCompanyNetGroupedByCreatedBy(
    companyId: number,
    page = 1,
    size = 10
  ) {
    const groupedResults = await prisma.report.groupBy({
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

    const transactionsGrouped = await prisma.transaction.groupBy({
      by: ["employeeId", "type"],
      where: {
        companyId,
        employeeId: {in: paginated.map((r) => r.employeeId)},
      },
      _sum: {
        paidAmount: true,
      },
      orderBy: {
        employeeId: "asc",
      },
    });

    const summaryMap = new Map<number, {deposit: number; withdraw: number}>();

    for (const record of transactionsGrouped) {
      const employeeId = record.employeeId!;
      const sum = record._sum.paidAmount || 0;

      if (!summaryMap.has(employeeId)) {
        summaryMap.set(employeeId, {deposit: 0, withdraw: 0});
      }

      if (record.type === "DEPOSIT") {
        summaryMap.get(employeeId)!.deposit += sum;
      } else if (record.type === "WITHDRAW") {
        summaryMap.get(employeeId)!.withdraw += sum;
      }
    }

    // Fetch employee names for better readability
    const employees = await prisma.employee.findMany({
      where: {
        id: {in: paginated.map((r) => r.employeeId)},
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
      const values = summaryMap.get(r.employeeId)!;

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

  async getTransaction(data: {transactionId: number}) {
    const transaction = await prisma.transaction.findUnique({
      where: {id: data.transactionId},
      select: transactionSelect,
    });
    return transaction;
  }

  async updateTransaction(data: {
    transactionId: number;
    transactionData: TransactionUpdateType;
  }) {
    const transaction = await prisma.transaction.update({
      where: {id: data.transactionId},
      data: data.transactionData,
      select: transactionSelect,
    });
    return transaction;
  }

  async deleteTransaction(data: {transactionId: number}) {
    await prisma.transaction.delete({
      where: {id: data.transactionId},
    });
    return true;
  }
}
