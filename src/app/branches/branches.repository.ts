import type {Governorate} from "@prisma/client";
import {prisma} from "../../database/db";
import type {BranchCreateType, BranchUpdateType} from "./branches.dto";
import {branchSelect} from "./branches.responses";

export class BranchesRepository {
  async createBranch(companyID: number, data: BranchCreateType) {
    const createdBranch = await prisma.branch.create({
      data: {
        name: data.name,
        governorate: data.governorate,
        branchCLient: data.branchCLient,
        branchOrder: data.branchOrder,
        company: {
          connect: {
            id: companyID,
          },
        },
      },
      select: branchSelect,
    });
    return createdBranch;
  }

  async getAllBranchesPaginated(filters: {
    page: number;
    size: number;
    companyID?: number;
    governorate?: Governorate;
    locationID?: number;
    minified?: boolean;
    getAll?: boolean;
    branchID?: number;
  }) {
    const where = {
      id: filters.getAll
        ? undefined
        : filters.branchID
        ? filters.branchID
        : undefined,
      company: {
        id: filters.companyID,
      },
      governorate: filters.governorate,
      locations: filters.locationID
        ? {
            some: {
              id: filters.locationID,
            },
          }
        : undefined,
    };

    if (filters.minified === true) {
      const paginatedBranches = await prisma.branch.findManyPaginated(
        {
          where: where,
          select: {
            id: true,
            name: true,
          },
        },
        {
          page: 1,
          size: 10000,
        }
      );
      return {
        branches: paginatedBranches.data,
        pagesCount: paginatedBranches.pagesCount,
      };
    }

    const paginatedBranches = await prisma.branch.findManyPaginated(
      {
        where: where,
        orderBy: {
          name: "asc",
        },
        select: branchSelect,
      },
      {
        page: filters.page,
        size: filters.size,
      }
    );

    return {
      branches: paginatedBranches.data,
      pagesCount: paginatedBranches.pagesCount,
    };
  }

  async getBranch(data: {branchID: number}) {
    const branch = await prisma.branch.findUnique({
      where: {
        id: data.branchID,
      },
      select: branchSelect,
    });
    return branch;
  }

  async updateBranch(data: {branchID: number; branchData: BranchUpdateType}) {
    const branch = await prisma.branch.update({
      where: {
        id: data.branchID,
      },
      data: {
        name: data.branchData.name,
        governorate: data.branchData.governorate,
        branchCLient: data.branchData.branchCLient,
        branchOrder: data.branchData.branchOrder,
      },
      select: branchSelect,
    });
    return branch;
  }

  async deleteBranch(data: {branchID: number}) {
    await prisma.branch.delete({
      where: {
        id: data.branchID,
      },
    });
    return true;
  }

  async getBranchManagerBranch(data: {branchManagerID: number}) {
    const branch = await prisma.branch.findFirst({
      where: {
        employees: {
          some: {
            id: data.branchManagerID,
          },
        },
      },
      select: {
        id: true,
        governorate: true,
      },
    });
    return branch;
  }

  async getBranchByLocation(data: {locationID: number}) {
    const branch = await prisma.branch.findFirst({
      where: {
        locations: {
          some: {
            id: data.locationID,
          },
        },
      },
      select: branchSelect,
    });
    return branch;
  }
}
