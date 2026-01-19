import {AdminRole, ClientRole, EmployeeRole} from "@prisma/client";
import * as bcrypt from "bcrypt";
import {env} from "../../config";
import {AppError} from "../../lib/AppError";
import {catchAsync} from "../../lib/catchAsync";
import type {loggedInUserType} from "../../types/user";
// import { BranchesRepository } from "../branches/branches.repository";
import {EmployeesRepository} from "../employees/employees.repository";
import {sendNotification} from "../notifications/helpers/sendNotification";
import {ClientCreateSchema, ClientUpdateSchema} from "./clients.dto";
import {ClientsRepository} from "./clients.repository";
import crypto from "crypto";
import {prisma} from "../../database/db";

const clientsRepository = new ClientsRepository();
const employeesRepository = new EmployeesRepository();
// const branchesRepository = new BranchesRepository();

export class ClientsController {
  createClient = catchAsync(async (req, res) => {
    const clientData = ClientCreateSchema.parse(req.body);
    let companyID = +res.locals.user.companyID;
    const {password, ...rest} = clientData;

    let avatar: string | undefined;
    if (req.file) {
      const file = req.file as Express.MulterS3.File;
      avatar = file.location;
    }

    const currentUser = res.locals.user;
    // TODO: CANT CRATE ADMIN_ASSISTANT

    if (
      !companyID &&
      (currentUser.role === AdminRole.ADMIN ||
        currentUser.role === AdminRole.ADMIN_ASSISTANT)
    ) {
      companyID = clientData.companyID as number;
    }

    // hash the password
    const hashedPassword = bcrypt.hashSync(
      password + (env.PASSWORD_SALT as string),
      12
    );

    const createdClient = await clientsRepository.createClient(companyID, {
      ...rest,
      password: hashedPassword,
      userID: currentUser.id,
      avatar,
    });

    res.status(200).json({
      status: "success",
      data: createdClient,
    });
  });

  generateApikey = catchAsync(async (req, res) => {
    const {id} = req.body;

    if (!id) {
      throw new AppError("Client name and permissions are required", 400);
    }

    const client = await clientsRepository.getClient({
      clientID: id,
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    const rawApiKey = `albarq_live_${crypto.randomBytes(32).toString("hex")}`;

    const apiKeyHash = crypto
      .createHash("sha256")
      .update(rawApiKey)
      .digest("hex");

    await prisma.client.update({
      where: {
        id: client.id,
      },
      data: {
        apiKeyHash,
      },
    });

    res.status(200).json({
      status: "success",
      apiKey: rawApiKey,
    });
  });

  getAllClients = catchAsync(async (req, res) => {
    // Filters
    const loggedInUser = res.locals.user as loggedInUserType;
    let companyID: number | undefined;
    if (Object.keys(AdminRole).includes(loggedInUser.role)) {
      companyID = req.query.company_id ? +req.query.company_id : undefined;
    } else if (loggedInUser.companyID) {
      companyID = loggedInUser.companyID;
    }

    // Show only clients of the same branch as the logged in user
    let branchID: number | undefined = req.query.branch_id
      ? +req.query.branch_id
      : undefined;
    if (
      loggedInUser.role !== EmployeeRole.COMPANY_MANAGER &&
      loggedInUser.role !== AdminRole.ADMIN &&
      loggedInUser.role !== AdminRole.ADMIN_ASSISTANT
    ) {
      const employee = await employeesRepository.getEmployee({
        employeeID: loggedInUser.id,
      });
      branchID = employee?.branch?.id;
      // if (!branch) {
      //     throw new AppError("انت غير مرتبط بفرع", 500);
      // }
      // // TODO: Every branch should have a governorate
      // if (!branch.governorate) {
      //     throw new AppError("الفرع الذي تعمل به غير مرتبط بمحافظة", 500);
      // }
    }

    const phone = req.query.phone as string | undefined;

    const name = req.query.name as string | undefined;

    const deleted = (req.query.deleted as string) || "false";

    const storeID = req.query.store_id ? +req.query.store_id : undefined;

    const minified = req.query.minified
      ? req.query.minified === "true"
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

    const {clients, pagesCount} =
      await clientsRepository.getAllClientsPaginated({
        page: page,
        size: size,
        deleted: deleted,
        companyID: companyID,
        minified: minified,
        storeID: storeID,
        branchID: branchID,
        phone: phone,
        name: name,
        loggedInUser,
      });

    res.status(200).json({
      status: "success",
      page: page,
      pagesCount: pagesCount,
      data: clients,
    });
  });

  getClient = catchAsync(async (req, res) => {
    const clientID = +req.params.clientID;
    const loggedInUser = res.locals.user as loggedInUserType;

    if (
      loggedInUser.role === ClientRole.CLIENT ||
      loggedInUser.role === EmployeeRole.CLIENT_ASSISTANT
    ) {
      if (clientID !== loggedInUser.id) {
        throw new AppError("غير مصرح لك الاطلاع علي بيانات عميل اخر", 403);
      }
    }

    const client = await clientsRepository.getClient({
      clientID: clientID,
    });

    res.status(200).json({
      status: "success",
      data: client,
    });
  });

  updateClient = catchAsync(async (req, res) => {
    const clientData = ClientUpdateSchema.parse(req.body);
    const clientID = +req.params.clientID;
    // const companyID = +res.locals.user.companyID;

    let avatar: string | undefined;
    if (req.file) {
      const file = req.file as Express.MulterS3.File;
      avatar = file.location;
    }

    const oldClient = await clientsRepository.getClient({
      clientID: clientID,
    });

    const {password, ...rest} = clientData;

    // hash the password
    const hashedPassword = bcrypt.hashSync(
      password + (env.PASSWORD_SALT as string),
      12
    );

    const updatedClient = await clientsRepository.updateClient({
      clientID: clientID,
      // companyID: companyID,
      clientData: {
        ...rest,
        password: clientData.password ? hashedPassword : undefined,
        avatar,
      },
    });

    // Send notification to the company manager if the client name is updated
    if (clientData.name && oldClient?.name !== updatedClient?.name) {
      // get the company manager id
      const companyManager = await employeesRepository.getCompanyManager({
        companyID: updatedClient?.company.id as number,
      });

      await sendNotification({
        userID: companyManager?.id as number,
        title: "تغيير اسم عميل",
        content: `تم تغيير اسم العميل ${oldClient?.name} إلى ${updatedClient?.name}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedClient,
    });
  });

  deleteClient = catchAsync(async (req, res) => {
    const clientID = +req.params.clientID;

    await clientsRepository.deleteClient({
      clientID: clientID,
    });

    res.status(200).json({
      status: "success",
    });
  });

  deactivateClient = catchAsync(async (req, res) => {
    const clientID = +req.params.clientID;
    const loggedInUserID = +res.locals.user.id;

    await clientsRepository.deactivateClient({
      clientID: clientID,
      deletedByID: loggedInUserID,
    });

    res.status(200).json({
      status: "success",
    });
  });

  reactivateClient = catchAsync(async (req, res) => {
    const clientID = +req.params.clientID;

    await clientsRepository.reactivateClient({
      clientID: clientID,
    });

    res.status(200).json({
      status: "success",
    });
  });
}
