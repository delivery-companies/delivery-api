import {
  AdminRole,
  ClientRole,
  EmployeeRole,
  type Governorate,
} from "@prisma/client";
// import { loggedInUserType } from "../../types/user";
import { AppError } from "../../lib/AppError";
import { catchAsync } from "../../lib/catchAsync";
import type { loggedInUserType } from "../../types/user";
import { LocationCreateSchema, LocationUpdateSchema } from "./locations.dto";
import { LocationsRepository } from "./locations.repository";
import { EmployeesRepository } from "../employees/employees.repository";

const locationsRepository = new LocationsRepository();
const employeesRepository = new EmployeesRepository();

export class LocationsController {
  createLocation = catchAsync(async (req, res) => {
    const locationData = LocationCreateSchema.parse(req.body);
    // const companyID = +res.locals.user.companyID;
    const loggedInUser = res.locals.user as loggedInUserType;

    // // TODO: maybe make this a middleware
    // // only main company can employees can create locations
    // if (!loggedInUser.mainCompany) {
    //   throw new AppError("فقط الشركة الرئيسية يمكنها إضافة مناطق جديدة", 403);
    // }

    const createdLocation = await locationsRepository.createLocation(
      loggedInUser,
      locationData
    );

    res.status(200).json({
      status: "success",
      data: createdLocation,
    });
  });

  getAllLocations = catchAsync(async (req, res) => {
    // Filters
    const loggedInUser = res.locals.user as loggedInUserType;
    let companyID: number | undefined;
    if (Object.keys(AdminRole).includes(loggedInUser.role)) {
      companyID = req.query.company_id ? +req.query.company_id : undefined;
    } else if (loggedInUser.companyID) {
      companyID = loggedInUser.companyID;
    }

    // Show only locations of the same branch as the logged in user
    let branchID: number | undefined = req.query.branch_id
      ? +req.query.branch_id
      : undefined;
    if (
      loggedInUser.role !== EmployeeRole.COMPANY_MANAGER &&
      loggedInUser.role !== AdminRole.ADMIN &&
      loggedInUser.role !== AdminRole.ADMIN_ASSISTANT &&
      loggedInUser.role !== ClientRole.CLIENT &&
      loggedInUser.role !== EmployeeRole.CLIENT_ASSISTANT
    ) {
      const employee = await employeesRepository.getEmployee({
        employeeID: loggedInUser.id,
      });
      branchID = employee?.branch?.id;
    }

    const minified = req.query.minified
      ? req.query.minified === "true"
      : undefined;

    const search = req.query.search as string;

    const governorate = req.query.governorate?.toString().toUpperCase() as
      | Governorate
      | undefined;

    // const branchID = req.query.branch_id ? +req.query.branch_id : undefined;

    const deliveryAgentID = req.query.delivery_agent_id
      ? +req.query.delivery_agent_id
      : undefined;

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

    const { locations, pagesCount } =
      await locationsRepository.getAllLocationsPaginated({
        page: page,
        size: size,
        search: search,
        branchID: branchID,
        governorate: governorate,
        deliveryAgentID: deliveryAgentID,
        companyID: companyID,
        minified: minified,
      });

    res.status(200).json({
      status: "success",
      page: page,
      pagesCount: pagesCount,
      data: locations,
    });
  });

  getLocation = catchAsync(async (req, res) => {
    const locationID = +req.params.locationID;

    const location = await locationsRepository.getLocation({
      locationID: locationID,
    });

    res.status(200).json({
      status: "success",
      data: location,
    });
  });

  updateLocation = catchAsync(async (req, res) => {
    const locationID = +req.params.locationID;
    const loggedInUser = res.locals.user as loggedInUserType;

    const locationData = LocationUpdateSchema.parse(req.body);

    const location = await locationsRepository.updateLocation({
      loggedInUser: loggedInUser,
      locationID: locationID,
      locationData: locationData,
    });

    res.status(200).json({
      status: "success",
      data: location,
    });
  });

  deleteLocation = catchAsync(async (req, res) => {
    const locationID = +req.params.locationID;

    await locationsRepository.deleteLocation({
      locationID: locationID,
    });

    res.status(200).json({
      status: "success",
    });
  });

  publicGetAllLocations = catchAsync(async (_req, res) => {
    const locations = await locationsRepository.publicGetAllLocations();

    res.status(200).json(locations);
  });
}
