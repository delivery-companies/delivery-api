import type {AdminRole, ClientRole, EmployeeRole, Prisma} from "@prisma/client";

export const userSelect = {
  id: true,
  password: true,
  username: true,
  name: true,
  admin: {
    select: {
      role: true,
    },
  },
  employee: {
    select: {
      role: true,
      permissions: true,
      orderStatus: true,
      branchId: true,
      clientId: true,
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          mainCompany: true,
        },
      },
      branch: {
        select: {
          repositories: {
            select: {
              mainRepository: true,
            },
          },
        },
      },
      repository: {
        select: {
          id: true,
          mainRepository: true,
          name: true,
          type: true,
        },
      },
    },
  },
  client: {
    select: {
      role: true,
      branchId: true,
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          mainCompany: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export const userReform = (
  user: Prisma.UserGetPayload<{
    select: typeof userSelect;
  }> | null
) => {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    password: user.password,
    name: user.name,
    clientId: user.employee?.clientId,
    companyID: user.employee?.company.id || user.client?.company.id || null,
    companyName:
      user.employee?.company.name || user.client?.company.name || null,
    mainCompany:
      user.employee?.company.mainCompany ??
      user.client?.company.mainCompany ??
      null,
    branchId:
      user.employee?.branchId ??
      user.employee?.branchId ??
      user.client?.branchId,
    repositoryId:
      user.employee?.repository?.id ?? user.employee?.repository?.id ?? null,
    mainRepository:
      user.employee?.branch?.repositories[0]?.mainRepository || false,
    repository: user.employee?.repository?.name,
    type: user.employee?.repository?.type,
    role: (user.admin?.role || user.employee?.role || user.client?.role) as
      | AdminRole
      | EmployeeRole
      | ClientRole,
    permissions: user.employee?.permissions || [],
    orderStatus: user.employee?.orderStatus || [],
  };
};
