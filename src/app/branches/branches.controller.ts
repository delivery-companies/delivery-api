import {AdminRole, type Governorate} from "@prisma/client";
import {catchAsync} from "../../lib/catchAsync";
import type {loggedInUserType} from "../../types/user";
import {BranchCreateSchema, BranchUpdateSchema} from "./branches.dto";
import {BranchesRepository} from "./branches.repository";

const branchesRepository = new BranchesRepository();

export class BranchesController {
  createBranch = catchAsync(async (req, res) => {
    const branchData = BranchCreateSchema.parse(req.body);
    const companyID = +res.locals.user.companyID;

    const createdBranch = await branchesRepository.createBranch(
      companyID,
      branchData
    );

    res.status(200).json({
      status: "success",
      data: createdBranch,
    });
  });

  getAllBranches = catchAsync(async (req, res) => {
    // Filters
    const loggedInUser = res.locals.user as loggedInUserType;

    let companyID: number | undefined;
    let branchID: number | undefined;
    let getAll: boolean | undefined;

    if (Object.keys(AdminRole).includes(loggedInUser.role)) {
      companyID = req.query.company_id ? +req.query.company_id : undefined;
    } else if (loggedInUser.companyID) {
      companyID = loggedInUser.companyID;
    }
    if (req.query.getAll === "true") {
      getAll = true;
    }
    if (
      loggedInUser.role !== "COMPANY_MANAGER" &&
      !loggedInUser.mainRepository
    ) {
      branchID = loggedInUser.branchId;
    }

    const minified = req.query.minified
      ? req.query.minified === "true"
      : undefined;

    const governorate = req.query.governorate?.toString().toUpperCase() as
      | Governorate
      | undefined;

    const locationID = req.query.location_id
      ? +req.query.location_id
      : undefined;

    // Pagination
    let size = req.query.size ? +req.query.size : 10;
    if (size > 500 && minified !== true) {
      size = 10;
    }
    let page = 1;
    if (
      req.query.page &&
      !Number.isNaN(+req.query.page) &&
      +req.query.page > 0
    ) {
      page = +req.query.page;
    }

    // Query
    const {branches, pagesCount} =
      await branchesRepository.getAllBranchesPaginated({
        page: page,
        size: size,
        companyID: companyID,
        branchID: branchID,
        governorate: governorate,
        locationID: locationID,
        minified: minified,
        getAll,
      });

    // Response
    res.status(200).json({
      status: "success",
      page: page,
      pagesCount: pagesCount,
      data: branches,
    });
  });

  getBranch = catchAsync(async (req, res) => {
    const branchID = +req.params.branchID;

    const branch = await branchesRepository.getBranch({
      branchID: branchID,
    });

    res.status(200).json({
      status: "success",
      data: branch,
    });
  });

  updateBranch = catchAsync(async (req, res) => {
    const branchID = +req.params.branchID;

    const branchData = BranchUpdateSchema.parse(req.body);

    const branch = await branchesRepository.updateBranch({
      branchID: branchID,
      branchData: branchData,
    });

    res.status(200).json({
      status: "success",
      data: branch,
    });
  });

  deleteBranch = catchAsync(async (req, res) => {
    const branchID = +req.params.branchID;

    await branchesRepository.deleteBranch({
      branchID: branchID,
    });

    res.status(200).json({
      status: "success",
    });
  });
}
