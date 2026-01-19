"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsController = void 0;
const client_1 = require("@prisma/client");
// import { loggedInUserType } from "../../types/user";
const catchAsync_1 = require("../../lib/catchAsync");
const locations_dto_1 = require("./locations.dto");
const locations_repository_1 = require("./locations.repository");
const employees_repository_1 = require("../employees/employees.repository");
const locationsRepository = new locations_repository_1.LocationsRepository();
const employeesRepository = new employees_repository_1.EmployeesRepository();
class LocationsController {
    createLocation = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const locationData = locations_dto_1.LocationCreateSchema.parse(req.body);
        // const companyID = +res.locals.user.companyID;
        const loggedInUser = res.locals.user;
        // // TODO: maybe make this a middleware
        // // only main company can employees can create locations
        // if (!loggedInUser.mainCompany) {
        //   throw new AppError("فقط الشركة الرئيسية يمكنها إضافة مناطق جديدة", 403);
        // }
        const createdLocation = await locationsRepository.createLocation(loggedInUser, locationData);
        res.status(200).json({
            status: "success",
            data: createdLocation,
        });
    });
    getAllLocations = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // Filters
        const loggedInUser = res.locals.user;
        let companyID;
        if (Object.keys(client_1.AdminRole).includes(loggedInUser.role)) {
            companyID = req.query.company_id ? +req.query.company_id : undefined;
        }
        else if (loggedInUser.companyID) {
            companyID = loggedInUser.companyID;
        }
        // Show only locations of the same branch as the logged in user
        let branchID = req.query.branch_id
            ? +req.query.branch_id
            : undefined;
        if (loggedInUser.role !== client_1.EmployeeRole.COMPANY_MANAGER &&
            loggedInUser.role !== client_1.AdminRole.ADMIN &&
            loggedInUser.role !== client_1.AdminRole.ADMIN_ASSISTANT &&
            loggedInUser.role !== client_1.ClientRole.CLIENT &&
            loggedInUser.role !== client_1.EmployeeRole.CLIENT_ASSISTANT) {
            const employee = await employeesRepository.getEmployee({
                employeeID: loggedInUser.id,
            });
            branchID = employee?.branch?.id;
        }
        const minified = req.query.minified
            ? req.query.minified === "true"
            : undefined;
        const search = req.query.search;
        const governorate = req.query.governorate?.toString().toUpperCase();
        // const branchID = req.query.branch_id ? +req.query.branch_id : undefined;
        const deliveryAgentID = req.query.delivery_agent_id
            ? +req.query.delivery_agent_id
            : undefined;
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500 && minified !== true) {
            size = 10;
        }
        let page = 1;
        if (req.query.page &&
            !Number.isNaN(+req.query.page) &&
            +req.query.page > 0) {
            page = +req.query.page;
        }
        const { locations, pagesCount } = await locationsRepository.getAllLocationsPaginated({
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
    getLocation = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const locationID = +req.params.locationID;
        const location = await locationsRepository.getLocation({
            locationID: locationID,
        });
        res.status(200).json({
            status: "success",
            data: location,
        });
    });
    updateLocation = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const locationID = +req.params.locationID;
        const loggedInUser = res.locals.user;
        const locationData = locations_dto_1.LocationUpdateSchema.parse(req.body);
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
    deleteLocation = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const locationID = +req.params.locationID;
        await locationsRepository.deleteLocation({
            locationID: locationID,
        });
        res.status(200).json({
            status: "success",
        });
    });
    publicGetAllLocations = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const governorate = req.query.governorate?.toString().toUpperCase();
        const locations = await locationsRepository.publicGetAllLocations(governorate);
        res.status(200).json(locations);
    });
}
exports.LocationsController = LocationsController;
//# sourceMappingURL=locations.controller.js.map