import type {
  AdminRole,
  ClientRole,
  EmployeeRole,
  Permission,
} from "@prisma/client";

// export type loggedInUserType = {
//     id: number;
//     name: string;
//     username: string;
//     role: AdminRole | EmployeeRole | ClientRole;
//     permissions: Permission[] | null;
//     companyID: AdminRole extends typeof role ? null : number;
//     companyName: AdminRole extends typeof role ? null : string;
// };

export type AdminUserType = {
  role: AdminRole;
  companyID: null;
  companyName: null;
  mainCompany: null;
};

export type NonAdminUserType = {
  role: EmployeeRole | ClientRole;
  companyID: number;
  companyName: string;
  mainCompany: boolean;
};

export type loggedInUserType = {
  id: number;
  name: string;
  username: string;
  clientId: number;
  branchId: number;
  repositoryId: number;
  mainRepository: boolean;
  permissions: Permission[];
} & (AdminUserType | NonAdminUserType);
