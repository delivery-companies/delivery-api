import {ReportType} from "@prisma/client";
import {prisma} from "../../database/db";
import {AppError} from "../../lib/AppError";
import type {loggedInUserType} from "../../types/user";
import type {
  ReportCreateType,
  ReportUpdateType,
  ReportsFiltersType,
} from "./reports.dto";
import {reportReform, reportSelect} from "./reports.responses";

export class ReportsRepository {
  async createReport(data: {
    loggedInUser: loggedInUserType;
    reportData: ReportCreateType & {ordersIDs: string[]};
    type?: string;
    // TODO: Make reportMetaData a type
    reportMetaData: {
      totalCost: number;
      paidAmount: number;
      deliveryCost: number;
      baghdadOrdersCount: number;
      governoratesOrdersCount: number;
      clientNet: number;
      deliveryAgentNet: number;
      companyNet: number;
      branchNet: number;
    };
  }) {
    const orders = {
      connect: data.reportData.ordersIDs.map((orderID) => {
        return {
          id: orderID,
        };
      }),
    };
    const report = {
      create: {
        type: data.reportData.type,
        createdBy: {
          connect: {
            id: data.loggedInUser.id,
          },
        },
        company: {
          connect: {
            // TODO: Is it always number ?
            id: data.loggedInUser.companyID as number,
          },
        },
        baghdadOrdersCount: data.reportMetaData.baghdadOrdersCount,
        governoratesOrdersCount: data.reportMetaData.governoratesOrdersCount,
        totalCost: data.reportMetaData.totalCost,
        paidAmount: data.reportMetaData.paidAmount,
        deliveryCost: data.reportMetaData.deliveryCost,
        clientNet: data.reportMetaData.clientNet,
        deliveryAgentNet: data.reportMetaData.deliveryAgentNet,
        companyNet: data.reportMetaData.companyNet,
        branchNet: data.reportMetaData.branchNet,
      },
    };
    if (data.reportData.type === ReportType.CLIENT) {
      const createdReport = await prisma.clientReport.create({
        data: {
          secondaryType: data.reportData.secondaryType,
          client: {
            connect: {
              id: data.reportData.clientID,
            },
          },
          // TODO
          store: {
            connect: {
              id: data.reportData.storeID,
            },
          },
          repository: data.reportData.repositoryID
            ? {
                connect: {
                  id: data.reportData.repositoryID,
                },
              }
            : undefined,
          orders: orders,
          baghdadDeliveryCost: data.reportData.baghdadDeliveryCost,
          governoratesDeliveryCost: data.reportData.governoratesDeliveryCost,
          receivingAgentId: data.reportData.receivingAgentId,
          report: report,
        },
      });
      return createdReport;
    }
    if (data.reportData.type === ReportType.REPOSITORY) {
      const createdReport = await prisma.repositoryReport.create({
        data: {
          secondaryType: data.reportData.secondaryType,
          targetRepositoryId: data.reportData.targetRepositoryId,
          targetRepositoryName: data.reportData.repositoryName,
          repository: {
            connect: {
              id: data.reportData.repositoryID,
            },
          },
          orders: orders,
          report: report,
        },
      });
      return createdReport;
    }

    if (data.reportData.type === ReportType.BRANCH) {
      const createdReport = await prisma.branchReport.create({
        data: {
          branch: {
            connect: {
              id: data.reportData.branchID,
            },
          },
          orders: orders,
          baghdadDeliveryCost: data.reportData.baghdadDeliveryCost,
          governoratesDeliveryCost: data.reportData.governoratesDeliveryCost,
          report: report,
          type: data.type,
        },
      });
      return createdReport;
    }
    if (data.reportData.type === ReportType.DELIVERY_AGENT) {
      const createdReport = await prisma.deliveryAgentReport.create({
        data: {
          deliveryAgent: {
            connect: {
              id: data.reportData.deliveryAgentID,
            },
          },
          orders: orders,
          deliveryAgentDeliveryCost: data.reportData.deliveryAgentDeliveryCost,
          report: report,
        },
      });
      return createdReport;
    }
    if (data.reportData.type === ReportType.GOVERNORATE) {
      const createdReport = await prisma.governorateReport.create({
        data: {
          governorate: data.reportData.governorate,
          orders: orders,
          baghdadDeliveryCost: data.reportData.baghdadDeliveryCost,
          governoratesDeliveryCost: data.reportData.governoratesDeliveryCost,
          report: report,
        },
      });
      return createdReport;
    }
    if (data.reportData.type === ReportType.COMPANY) {
      const createdReport = await prisma.companyReport.create({
        data: {
          secondaryType: data.reportData.secondaryType,
          company: {
            connect: {
              id: data.reportData.companyID,
            },
          },
          repository: data.reportData.repositoryID
            ? {
                connect: {
                  id: data.reportData.repositoryID,
                },
              }
            : undefined,
          orders: orders,
          baghdadDeliveryCost: data.reportData.baghdadDeliveryCost,
          governoratesDeliveryCost: data.reportData.governoratesDeliveryCost,
          report: report,
        },
      });
      return createdReport;
    }

    throw new AppError("Invalid report type", 400);
  }

  async getAllReportsPaginated(data: {filters: ReportsFiltersType}) {
    let startDate = new Date();
    let endDate = new Date();
    if (data.filters.startDate) {
      startDate = new Date(data.filters.startDate);
      startDate.setUTCDate(startDate.getUTCDate() - 1);
    }
    if (data.filters.endDate) {
      endDate = new Date(data.filters.endDate);
      // endDate.setUTCDate(endDate.getUTCDate() + 1);
      endDate.setHours(23, 59, 29);
    }
    const where = {
      AND: [
        {
          OR: [
            // TODO: Use employees as a branch filter instead of orders
            {
              deliveryAgentReport: data.filters.branch
                ? {
                    orders: {
                      some: {
                        branch: {
                          id: data.filters.branch,
                        },
                      },
                    },
                  }
                : undefined,
            },
            {
              clientReport: data.filters.branch
                ? {
                    client: {
                      branch: {
                        id: data.filters.branch,
                      },
                    },
                  }
                : undefined,
            },
            {
              repositoryReport: data.filters.branch
                ? {
                    orders: {
                      some: {
                        branch: {
                          id: data.filters.branch,
                        },
                      },
                    },
                  }
                : undefined,
            },
            {
              branchReport: data.filters.branch
                ? {
                    orders: {
                      some: {
                        branch: {
                          id: data.filters.branch,
                        },
                      },
                    },
                  }
                : undefined,
            },
          ],
        },
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
                lte: endDate,
              }
            : undefined,
        },
        {
          clientReport: {
            clientId: data.filters.clientID,
          },
        },
        {
          clientReport: {
            secondaryType: data.filters.secondaryType
              ? data.filters.secondaryType
              : undefined,
          },
        },
        {
          clientReport: {
            storeId: data.filters.storeID,
          },
        },
        {
          repositoryReport: {
            repositoryId: data.filters.repositoryID,
          },
        },
        {
          repositoryReport: {
            secondaryType:
              data.filters.type === "REPOSITORY"
                ? data.filters.secondaryType
                : undefined,
          },
        },
        {
          branchReport: {
            branchId: data.filters.branchID,
          },
        },
        {
          deliveryAgentReport: {
            deliveryAgentId: data.filters.deliveryAgentID,
          },
        },
        {
          governorateReport: {
            governorate: data.filters.governorate,
          },
        },
        {
          // TODO: fix this: Report type filter vs company filter
          companyReport: data.filters.companyID
            ? {
                companyId: data.filters.companyID,
              }
            : undefined,
        },
        {
          companyReport: {
            secondaryType:
              data.filters.type === "COMPANY"
                ? data.filters.secondaryType
                : undefined,
          },
        },
        {
          status: data.filters.status,
        },
        {
          type: data.filters.type,
        },
        {
          type: {in: data.filters.types},
        },
        {
          deleted: data.filters.deleted,
        },
        {
          company: {
            id: data.filters.company,
          },
        },
        {
          createdBy: {
            id: data.filters.createdByID,
          },
        },
      ],
    };

    if (data.filters.minified === true) {
      const paginatedReports = await prisma.report.findManyPaginated(
        {
          where: where,
          select: {
            id: true,
          },
        },
        {
          page: data.filters.page,
          size: data.filters.size,
        }
      );
      return {
        reports: {
          reports: paginatedReports.data,
          pagesCount: paginatedReports.pagesCount,
        },
      };
    }

    const paginatedReports = await prisma.report.findManyPaginated(
      {
        where: where,
        orderBy: {
          [data.filters.sort.split(":")[0]]:
            data.filters.sort.split(":")[1] === "desc" ? "desc" : "asc",
        },
        select: reportSelect,
      },
      {
        page: data.filters.page,
        size: data.filters.size,
      }
    );

    const reportsReformed = paginatedReports.data.map((report) =>
      reportReform(report)
    );

    const reportsMetaData = await prisma.report.aggregate({
      where: {
        ...where,
        OR:
          data.filters.type === "CLIENT"
            ? [
                {
                  clientReport: {
                    secondaryType: "DELIVERED",
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
        deliveryCost: true,
        baghdadOrdersCount: true,
        governoratesOrdersCount: true,
        clientNet: true,
        deliveryAgentNet: true,
        companyNet: true,
      },
    });

    const reportsMetaDataReformed = {
      reportsCount: reportsMetaData._count.id,
      totalCost: reportsMetaData._sum.totalCost,
      paidAmount: reportsMetaData._sum.paidAmount,
      deliveryCost: reportsMetaData._sum.deliveryCost,
      baghdadOrdersCount: reportsMetaData._sum.baghdadOrdersCount,
      governoratesOrdersCount: reportsMetaData._sum.governoratesOrdersCount,
      clientNet: reportsMetaData._sum.clientNet,
      deliveryAgentNet: reportsMetaData._sum.deliveryAgentNet,
      companyNet: reportsMetaData._sum.companyNet,
    };

    return {
      reports: reportsReformed,
      reportsMetaData: reportsMetaDataReformed,
      pagesCount: paginatedReports.pagesCount,
    };

    // return reports.map((report) => reportReform(report));
  }

  async getReportsByIDs(data: {reportsIDs: number[]}) {
    const reports = await prisma.report.findMany({
      where: {
        id: {
          in: data.reportsIDs,
        },
      },
      orderBy: {
        id: "asc",
      },
      select: reportSelect,
    });
    return reports.map(reportReform);
  }

  async getReport(data: {reportID: number}) {
    const report = await prisma.report.findUnique({
      where: {
        id: data.reportID,
      },
      select: reportSelect,
    });
    return reportReform(report);
  }

  async updateReport(data: {reportID: number; reportData: ReportUpdateType}) {
    const report = await prisma.report.update({
      where: {
        id: data.reportID,
      },
      data: {
        status: data.reportData.status,
        confirmed: data.reportData.confirmed,
        repositoryReport: data.reportData.repositoryID
          ? {
              update: {
                repositoryId: data.reportData.repositoryID,
              },
            }
          : undefined,
      },
      select: reportSelect,
    });

    if (data.reportData.repositoryID) {
      const repository = await prisma.repository.findUnique({
        where: {
          id: data.reportData.repositoryID,
        },
        select: {
          branchId: true,
        },
      });
      const orders = await prisma.order.findMany({
        where: {
          repositoryReport: {
            some: {
              id: data.reportID,
            },
          },
        },
        select: {
          id: true,
        },
      });
      orders.forEach(async (order) => {
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            repositoryId: data.reportData.repositoryID,
            branchId: repository?.branchId,
          },
        });
      });
    }
    if (
      report.clientReport &&
      report.clientReport.secondaryType === "RETURNED" &&
      data.reportData.confirmed
    ) {
      await prisma.order.updateMany({
        where: {
          clientReport: {
            some: {
              id: report.clientReport.id,
            },
          },
          status: {in: ["PARTIALLY_RETURNED", "REPLACED", "RETURNED"]},
        },
        data: {
          secondaryStatus: "WITH_CLIENT",
        },
      });
    }
    return reportReform(report);
  }

  async deleteReport(data: {reportID: number}) {
    const deletedReport = await prisma.report.delete({
      where: {
        id: data.reportID,
      },
      select: reportSelect,
    });
    return reportReform(deletedReport);
  }

  async deactivateReport(data: {reportID: number; deletedByID: number}) {
    const report = await prisma.report.findUnique({
      where: {
        id: data.reportID,
      },
      select: reportSelect,
    });

    if (
      (report?.type === "CLIENT" &&
        report.clientReport?.secondaryType === "RETURNED") ||
      (report?.type === "REPOSITORY" &&
        report.repositoryReport?.secondaryType === "RETURNED") ||
      (report?.type === "COMPANY" &&
        report.companyReport?.secondaryType === "RETURNED")
    ) {
      if (report?.type === "REPOSITORY") {
        await prisma.order.updateMany({
          where: {
            repositoryReport: {
              some: {
                id: report.repositoryReport?.id,
              },
            },
          },
          data: {
            repositoryId: report.repositoryReport?.repository.id,
            secondaryStatus: "IN_REPOSITORY",
          },
        });
      }
      if (report?.type === "CLIENT" && report.confirmed === false) {
        await prisma.order.updateMany({
          where: {
            clientReport: {
              some: {
                id: report.clientReport?.id,
              },
            },
          },
          data: {
            repositoryId: report.clientReport?.repository?.id,
            secondaryStatus: "IN_REPOSITORY",
          },
        });
      }
      if (report?.type === "COMPANY" && report.confirmed === false) {
        await prisma.order.updateMany({
          where: {
            companyReport: {
              some: {
                id: data.reportID,
              },
            },
          },
          data: {
            repositoryId: report.companyReport?.repository?.id,
            secondaryStatus: "IN_REPOSITORY",
          },
        });
      }
    }

    const deletedReport = await prisma.report.delete({
      where: {
        id: data.reportID,
      },
      select: reportSelect,
    });
    return reportReform(deletedReport);
  }

  async reactivateReport(data: {reportID: number}) {
    const deletedReport = await prisma.report.update({
      where: {
        id: data.reportID,
      },
      data: {
        deleted: false,
      },
      select: reportSelect,
    });
    return reportReform(deletedReport);
  }
}
