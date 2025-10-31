import type {Prisma} from "@prisma/client";

export const reportSelect = {
  id: true,
  status: true,
  confirmed: true,
  createdBy: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  baghdadOrdersCount: true,
  governoratesOrdersCount: true,
  totalCost: true,
  paidAmount: true,
  deliveryCost: true,
  clientNet: true,
  deliveryAgentNet: true,
  branchNet: true,
  companyNet: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  clientReport: {
    select: {
      id: true,
      secondaryType: true,
      repository: {
        select: {
          id: true,
          name: true,
        },
      },
      client: {
        select: {
          branch: {
            select: {
              id: true,
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
        },
      },
      store: {
        select: {
          id: true,
          name: true,
        },
      },
      orders: {
        select: {
          id: true,
          receiptNumber: true,
        },
      },
      baghdadDeliveryCost: true,
      governoratesDeliveryCost: true,
    },
  },
  repositoryReport: {
    select: {
      id: true,
      secondaryType: true,
      targetRepositoryId: true,
      targetRepositoryName: true,
      repository: {
        select: {
          id: true,
          name: true,
        },
      },
      orders: {
        select: {
          id: true,
          receiptNumber: true,
        },
      },
    },
  },
  branchReport: {
    select: {
      id: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      orders: {
        select: {
          id: true,
          receiptNumber: true,
          branchReportId: true,
        },
      },
      baghdadDeliveryCost: true,
      governoratesDeliveryCost: true,
    },
  },
  governorateReport: {
    select: {
      id: true,
      governorate: true,
      orders: {
        select: {
          id: true,
          receiptNumber: true,
          governorateReportId: true,
        },
      },
      baghdadDeliveryCost: true,
      governoratesDeliveryCost: true,
    },
  },
  deliveryAgentReport: {
    select: {
      id: true,
      deliveryAgent: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      orders: {
        select: {
          id: true,
          receiptNumber: true,
          deliveryAgentReportId: true,
        },
      },
      deliveryAgentDeliveryCost: true,
    },
  },
  companyReport: {
    select: {
      id: true,
      secondaryType: true,
      repository: {
        select: {
          id: true,
          name: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      orders: {
        select: {
          id: true,
          receiptNumber: true,
        },
      },
      baghdadDeliveryCost: true,
      governoratesDeliveryCost: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
      logo: true,
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
} satisfies Prisma.ReportSelect;

export const reportReform = (
  report: Prisma.ReportGetPayload<{
    select: typeof reportSelect;
  }> | null
) => {
  if (!report) {
    return null;
  }
  const reportData = {
    ...report,
    createdBy: report.createdBy.user,
    secondaryType:
      report.type === "CLIENT"
        ? report.clientReport?.secondaryType
        : report.type === "COMPANY"
        ? report.companyReport?.secondaryType
        : report.type === "REPOSITORY"
        ? report.repositoryReport?.secondaryType
        : "DELIVERED",
    clientReport: report.clientReport && {
      reportNumber: report.clientReport.id,
      clientReportOrders: report.clientReport.orders,
      client: report.clientReport.client.user,
      store: report.clientReport.store,
      branch: report.clientReport.client.branch,
      baghdadDeliveryCost: report.clientReport.baghdadDeliveryCost,
      governoratesDeliveryCost: report.clientReport.governoratesDeliveryCost,
      secondaryType: report.clientReport.secondaryType,
    },
    repositoryReport: report.repositoryReport && {
      reportNumber: report.repositoryReport.id,
      repositoryReportOrders: report.repositoryReport.orders,
      repository: report.repositoryReport.repository,
      secondaryType: report.repositoryReport.secondaryType,
      targetRepositoryId: report.repositoryReport.targetRepositoryId,
      targetRepositoryName: report.repositoryReport.targetRepositoryName,
    },
    branchReport: report.branchReport && {
      reportNumber: report.branchReport.id,
      branchReportOrders: report.branchReport.orders,
      branch: report.branchReport.branch,
      baghdadDeliveryCost: report.branchReport.baghdadDeliveryCost,
      governoratesDeliveryCost: report.branchReport.governoratesDeliveryCost,
    },
    governorateReport: report.governorateReport && {
      reportNumber: report.governorateReport.id,
      governorateReportOrders: report.governorateReport.orders,
      governorate: report.governorateReport.governorate,
      baghdadDeliveryCost: report.governorateReport.baghdadDeliveryCost,
      governoratesDeliveryCost:
        report.governorateReport.governoratesDeliveryCost,
    },
    deliveryAgentReport: report.deliveryAgentReport && {
      reportNumber: report.deliveryAgentReport.id,
      deliveryAgentReportOrders: report.deliveryAgentReport.orders,
      deliveryAgent: report.deliveryAgentReport.deliveryAgent.user,
      deliveryAgentDeliveryCost:
        report.deliveryAgentReport.deliveryAgentDeliveryCost,
    },
    companyReport: report.companyReport && {
      reportNumber: report.companyReport.id,
      companyReportOrders: report.companyReport.orders,
      company: report.companyReport.company,
      baghdadDeliveryCost: report.companyReport.baghdadDeliveryCost,
      governoratesDeliveryCost: report.companyReport.governoratesDeliveryCost,
      secondaryType: report.companyReport.secondaryType,
    },
    company: report.company,
    deleted: report.deleted,
    deletedBy: report.deleted && report.deletedBy,
    deletedAt: report.deletedAt?.toISOString(),
  };
  return reportData;
};

/* --------------------------------------------------------------- */
