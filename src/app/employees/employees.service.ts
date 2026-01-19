import {AdminRole, EmployeeRole} from "@prisma/client";
import * as bcrypt from "bcrypt";
import {env} from "../../config";
import {AppError} from "../../lib/AppError";
import type {loggedInUserType} from "../../types/user";
import {BranchesRepository} from "../branches/branches.repository";
import {sendNotification} from "../notifications/helpers/sendNotification";
import type {
  EmployeeCreateType,
  EmployeeUpdateType,
  EmployeesFiltersType,
} from "./employees.dto";
import {EmployeesRepository} from "./employees.repository";
import {prisma} from "../../database/db";

const employeesRepository = new EmployeesRepository();
const branchesRepository = new BranchesRepository();

export class EmployeesService {
  createEmployee = async (data: {
    loggedInUser: loggedInUserType;
    employeeData: EmployeeCreateType;
  }) => {
    let companyID = data.loggedInUser.companyID as number;
    if (
      !data.loggedInUser.companyID &&
      (data.loggedInUser.role === AdminRole.ADMIN ||
        data.loggedInUser.role === AdminRole.ADMIN_ASSISTANT)
    ) {
      companyID = data.employeeData.companyID as number;
    }

    if (
      data.loggedInUser.role !== EmployeeRole.COMPANY_MANAGER &&
      data.loggedInUser.role !== EmployeeRole.BRANCH_MANAGER &&
      data.loggedInUser.role !== AdminRole.ADMIN &&
      data.loggedInUser.role !== AdminRole.ADMIN_ASSISTANT &&
      data.loggedInUser.role !== EmployeeRole.CLIENT &&
      data.loggedInUser.role !== EmployeeRole.CLIENT_ASSISTANT &&
      data.loggedInUser.role !== EmployeeRole.EMPLOYEE_CLIENT_ASSISTANT &&
      !data.loggedInUser.permissions.includes("MANAGE_EMPLOYEES")
    ) {
      throw new AppError("ليس مصرح لك القيام بهذا الفعل", 403);
    }

    const checkIfUserNameExist = await prisma.user.findFirst({
      where: {
        username: data.employeeData.username,
      },
      select: {
        id: true,
      },
    });

    if (checkIfUserNameExist) {
      throw new AppError("اسم المستخدم موجود!", 403);
    }

    const hashedPassword = bcrypt.hashSync(
      data.employeeData.password + (env.PASSWORD_SALT as string),
      12
    );

    if (data.employeeData.repositoryID) {
      const repository = await prisma.repository.findFirst({
        where: {
          id: data.employeeData.repositoryID,
          branchId: data.employeeData.branchID,
        },
      });
      if (!repository) {
        throw new AppError("هذا المخزن غير مرتبط بالفرع", 404);
      }
    }
    const createdEmployee = await employeesRepository.createEmployee({
      companyID,
      loggedInUser: data.loggedInUser,
      employeeData: {
        ...data.employeeData,
        password: hashedPassword,
      },
    });

    return createdEmployee;
  };

  getAllEmployees = async (data: {
    filters: EmployeesFiltersType;
    loggedInUser: loggedInUserType;
  }) => {
    let companyID: number | undefined;
    if (Object.keys(AdminRole).includes(data.loggedInUser.role)) {
      companyID = data.filters.companyID;
    } else if (data.loggedInUser.companyID) {
      companyID = data.loggedInUser.companyID;
    }

    // Only show delivery agents from the branch of the logged in branch manager
    let branchID: number | undefined, clientId: number | undefined;
    let roles: EmployeeRole[] | undefined = data.filters.roles;
    if (
      data.loggedInUser.role === EmployeeRole.BRANCH_MANAGER ||
      data.loggedInUser.role === EmployeeRole.REPOSITORIY_EMPLOYEE
    ) {
      const branch = await branchesRepository.getBranchManagerBranch({
        branchManagerID: data.loggedInUser.id,
      });
      branchID = branch?.id;
      roles = data.filters.roles || ["DELIVERY_AGENT", "RECEIVING_AGENT"];
    } else {
      branchID = data.filters.branchID;
    }

    if (
      data.loggedInUser.role !== "ACCOUNT_MANAGER" &&
      data.loggedInUser.role !== "COMPANY_MANAGER" &&
      !data.loggedInUser.mainRepository
    ) {
      branchID = data.loggedInUser.branchId;
    }
    if (data.loggedInUser.role === "CLIENT") {
      clientId = data.loggedInUser.id;
      branchID = undefined;
    }

    if (data.loggedInUser.role === "CLIENT_ASSISTANT") {
      const employee = await prisma.employee.findUnique({
        where: {
          id: data.loggedInUser.id,
        },
        select: {
          clientId: true,
        },
      });
      clientId = employee?.clientId!;
    }

    const {employees, pagesCount} =
      await employeesRepository.getAllEmployeesPaginated({
        loggedInUser: data.loggedInUser,
        filters: {...data.filters, companyID, branchID, roles, clientId},
      });

    return {employees, pagesCount};
  };

  getEmployee = async (data: {
    params: {
      employeeID: number;
    };
  }) => {
    const employee = await employeesRepository.getEmployee({
      employeeID: data.params.employeeID,
    });
    const inD = await prisma.inquiryEmployeesDeliveryAgents.findMany({
      where: {
        inquiryEmployeeId: data.params.employeeID,
      },
      select: {
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
      },
    });
    return {
      ...employee,
      inquiryDeliveryAgents: inD.map((deliveryAgent) => {
        return deliveryAgent.deliveryAgent.user;
      }),
    };
  };

  updateEmployee = async (data: {
    params: {
      employeeID: number;
    };
    employeeData: EmployeeUpdateType;
  }) => {
    const oldEmployee = await employeesRepository.getEmployee({
      employeeID: data.params.employeeID,
    });

    if (data.employeeData.password) {
      const hashedPassword = bcrypt.hashSync(
        data.employeeData.password + (env.PASSWORD_SALT as string),
        12
      );
      data.employeeData.password = hashedPassword;
    }

    if (data.employeeData.repositoryID) {
      const repository = await prisma.repository.findFirst({
        where: {
          id: data.employeeData.repositoryID,
          branchId: data.employeeData.branchID,
        },
      });
      if (!repository) {
        throw new AppError("هذا المخزن غير مرتبط بالفرع", 404);
      }
    }
    const updatedEmployee = await employeesRepository.updateEmployee({
      employeeID: data.params.employeeID,
      // companyID: companyID,
      employeeData: data.employeeData,
    });

    // Send notification to the company manager if the delviery agent name is updated
    if (
      data.employeeData.name &&
      (updatedEmployee?.role === "DELIVERY_AGENT" ||
        updatedEmployee?.role === "RECEIVING_AGENT") &&
      oldEmployee?.name !== updatedEmployee?.name
    ) {
      // get the company manager id
      const companyManager = await employeesRepository.getCompanyManager({
        companyID: updatedEmployee.company.id,
      });

      await sendNotification({
        userID: companyManager?.id as number,
        title: "تغيير اسم مندوب",
        content: `تم تغيير اسم المندوب ${oldEmployee?.name} إلى ${updatedEmployee?.name}`,
      });
    }

    return updatedEmployee;
  };

  deleteEmployee = async (data: {
    params: {
      employeeID: number;
    };
  }) => {
    await employeesRepository.deleteEmployee({
      employeeID: data.params.employeeID,
    });
  };

  deactivateEmployee = async (data: {
    params: {
      employeeID: number;
    };
    loggedInUser: loggedInUserType;
  }) => {
    await employeesRepository.deactivateEmployee({
      employeeID: data.params.employeeID,
      deletedByID: data.loggedInUser.id,
    });
  };

  reactivateEmployee = async (data: {
    params: {
      employeeID: number;
    };
  }) => {
    await employeesRepository.reactivateEmployee({
      employeeID: data.params.employeeID,
    });
  };
}
