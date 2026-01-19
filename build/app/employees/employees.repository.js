"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesRepository = void 0;
const db_1 = require("../../database/db");
const employees_responses_1 = require("./employees.responses");
class EmployeesRepository {
    async createEmployee(data) {
        const employee = await db_1.prisma.employee.findUnique({
            where: {
                id: data.loggedInUser.id,
            },
            select: {
                clientId: true,
            },
        });
        const clientConnect = data.employeeData.role === "CLIENT_ASSISTANT"
            ? {
                connect: {
                    id: data.loggedInUser.role === "CLIENT"
                        ? data.loggedInUser.id
                        : employee?.clientId,
                },
            }
            : undefined;
        const createdEmployee = await db_1.prisma.employee.create({
            data: {
                user: {
                    create: {
                        name: data.employeeData.name,
                        username: data.employeeData.username,
                        password: data.employeeData.password,
                        phone: data.employeeData.phone,
                        fcm: data.employeeData.fcm,
                        avatar: data.employeeData.avatar,
                    },
                },
                idCard: data.employeeData.idCard,
                residencyCard: data.employeeData.residencyCard,
                clientAssistantRole: data.employeeData.clientAssistantRole,
                salary: data.employeeData.salary,
                orderType: data.employeeData.orderType,
                role: data.employeeData.role === "EMERGENCY_EMPLOYEE" ||
                    data.employeeData.role === "MAIN_EMERGENCY_EMPLOYEE"
                    ? "INQUIRY_EMPLOYEE"
                    : data.employeeData.role,
                emergency: data.employeeData.role === "EMERGENCY_EMPLOYEE" ? true : false,
                mainEmergency: data.employeeData.role === "MAIN_EMERGENCY_EMPLOYEE" ? true : false,
                Client: clientConnect,
                company: {
                    connect: {
                        id: data.companyID,
                    },
                },
                permissions: data.employeeData.permissions
                    ? {
                        set: data.employeeData.permissions,
                    }
                    : undefined,
                orderStatus: data.employeeData.orderStatus
                    ? {
                        set: data.employeeData.orderStatus,
                    }
                    : undefined,
                branch: data.employeeData.branchID
                    ? {
                        connect: {
                            id: data.employeeData.branchID,
                        },
                    }
                    : undefined,
                repository: data.employeeData.repositoryID
                    ? {
                        connect: {
                            id: data.employeeData.repositoryID,
                        },
                    }
                    : undefined,
                inquiryStores: data.employeeData.inquiryStoresIDs
                    ? {
                        create: data.employeeData.inquiryStoresIDs.map((storeID) => {
                            return {
                                store: {
                                    connect: {
                                        id: storeID,
                                    },
                                },
                            };
                        }),
                    }
                    : data.employeeData.storesIDs
                        ? {
                            create: data.employeeData.storesIDs.map((storeID) => {
                                return {
                                    store: {
                                        connect: {
                                            id: storeID,
                                        },
                                    },
                                };
                            }),
                        }
                        : undefined,
                inquiryLocations: data.employeeData.inquiryLocationsIDs
                    ? {
                        createMany: {
                            data: data.employeeData.inquiryLocationsIDs.map((locationID) => {
                                return {
                                    locationId: locationID,
                                };
                            }),
                        },
                    }
                    : undefined,
                inquiryBranches: data.employeeData.inquiryBranchesIDs
                    ? {
                        createMany: {
                            data: data.employeeData.inquiryBranchesIDs.map((branchID) => {
                                return {
                                    branchId: branchID,
                                };
                            }),
                        },
                    }
                    : undefined,
                inquiryCompanies: data.employeeData.inquiryCompaniesIDs
                    ? {
                        createMany: {
                            data: data.employeeData.inquiryCompaniesIDs.map((companyID) => {
                                return {
                                    companyId: companyID,
                                };
                            }),
                        },
                    }
                    : undefined,
                inquiryGovernorates: data.employeeData.inquiryGovernorates
                    ? {
                        set: data.employeeData.inquiryGovernorates,
                    }
                    : undefined,
                inquiryStatuses: data.employeeData.inquiryStatuses
                    ? {
                        set: data.employeeData.inquiryStatuses,
                    }
                    : undefined,
                createdBy: {
                    connect: {
                        id: data.loggedInUser.id,
                    },
                },
            },
            select: employees_responses_1.employeeSelect,
        });
        if (data.employeeData.inquiryDeliveryAgentsIDs?.length) {
            await db_1.prisma.inquiryEmployeesDeliveryAgents.createMany({
                data: data.employeeData.inquiryDeliveryAgentsIDs.map((id) => ({
                    deliveryAgentId: id,
                    inquiryEmployeeId: createdEmployee.user.id,
                })),
            });
        }
        return (0, employees_responses_1.employeeReform)(createdEmployee);
    }
    async getAllEmployeesPaginated(data) {
        let emergency = false;
        let mainEmergency = false;
        if (data.filters.roles?.includes("EMERGENCY_EMPLOYEE")) {
            emergency = true;
        }
        if (data.filters.roles?.includes("MAIN_EMERGENCY_EMPLOYEE")) {
            mainEmergency = true;
        }
        let deliveryStartDate = new Date();
        let deliveryEndDate = new Date();
        if (data.filters.ordersStartDate) {
            deliveryStartDate = new Date(data.filters.ordersStartDate);
        }
        if (data.filters.ordersEndDate) {
            deliveryEndDate = new Date(data.filters.ordersEndDate);
        }
        const where = {
            AND: [
                {
                    permissions: data.filters.permissions
                        ? { hasEvery: data.filters.permissions }
                        : undefined,
                },
                {
                    user: data.filters.name
                        ? { name: { contains: data.filters.name } }
                        : undefined,
                },
                {
                    user: data.filters.phone
                        ? { phone: { contains: data.filters.phone } }
                        : undefined,
                },
                {
                    role: data.loggedInUser.role !== "CLIENT" &&
                        data.loggedInUser.role !== "CLIENT_ASSISTANT" &&
                        !data.filters.roles
                        ? { not: "CLIENT_ASSISTANT" }
                        : { in: data.filters.roles },
                },
                {
                    clientId: data.loggedInUser.role !== "CLIENT" &&
                        data.loggedInUser.role !== "CLIENT_ASSISTANT"
                        ? null
                        : undefined,
                },
                {
                    role: data.filters.role,
                },
                {
                    emergency: data.filters.role === "INQUIRY_EMPLOYEE" ||
                        data.filters.roles?.includes("INQUIRY_EMPLOYEE")
                        ? false
                        : undefined,
                },
                {
                    mainEmergency: data.filters.role === "INQUIRY_EMPLOYEE" ||
                        data.filters.roles?.includes("INQUIRY_EMPLOYEE")
                        ? false
                        : undefined,
                },
                {
                    branch: data.filters.branchID
                        ? {
                            id: data.filters.branchID,
                        }
                        : undefined,
                },
                {
                    Client: {
                        id: data.filters.clientId,
                    },
                },
                {
                    deliveryAgentsLocations: data.filters.locationID
                        ? data.filters.roles?.find((role) => {
                            return role === "DELIVERY_AGENT" || role === "RECEIVING_AGENT";
                        })
                            ? {
                                some: {
                                    location: {
                                        id: data.filters.locationID,
                                    },
                                },
                            }
                            : undefined
                        : undefined,
                },
                { deleted: data.filters.deleted },
                {
                    company: {
                        id: data.filters.companyID,
                    },
                },
            ],
        };
        if (data.filters.minified === true) {
            const employees = await db_1.prisma.employee.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    branchId: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            }, {
                page: data.filters.page,
                size: data.filters.size,
            });
            return {
                employees: employees.data.map((employee) => {
                    return {
                        id: employee.id,
                        name: employee.user.name,
                        branchId: employee.branchId,
                    };
                }),
                pagesCount: employees.pagesCount,
            };
        }
        const employees = await db_1.prisma.employee.findManyPaginated({
            where: {
                OR: [
                    where,
                    emergency
                        ? {
                            emergency: true,
                            role: "INQUIRY_EMPLOYEE",
                            companyId: data.loggedInUser.companyID ?? undefined,
                        }
                        : mainEmergency
                            ? {
                                mainEmergency: true,
                                role: "INQUIRY_EMPLOYEE",
                                companyId: data.loggedInUser.companyID ?? undefined,
                            }
                            : {},
                ],
            },
            orderBy: {
                id: "asc",
            },
            select: {
                ...employees_responses_1.employeeSelect,
                _count: {
                    select: {
                        orders: {
                            where: {
                                AND: [
                                    { confirmed: true },
                                    { deleted: false },
                                    {
                                        deliveryDate: data.filters.ordersStartDate
                                            ? {
                                                gte: deliveryStartDate,
                                            }
                                            : undefined,
                                    },
                                    // Filter by endDate
                                    {
                                        deliveryDate: data.filters.ordersEndDate
                                            ? {
                                                lt: deliveryEndDate,
                                            }
                                            : undefined,
                                    },
                                ],
                            },
                        },
                        // deliveryAgentsLocations: true
                    },
                },
            },
        }, {
            page: data.filters.page,
            size: data.filters.size,
        });
        return {
            employees: employees.data.map(employees_responses_1.employeeReform),
            pagesCount: employees.pagesCount,
        };
    }
    async getInquiryEmployeeStuff(data) {
        const employee = await db_1.prisma.employee.findUnique({
            where: {
                id: data.employeeID,
            },
            select: {
                orderType: true,
                inquiryBranches: {
                    select: {
                        branch: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                inquiryLocations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                inquiryCompanies: {
                    select: {
                        company: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                inquiryStores: {
                    select: {
                        store: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                inquiryDeliveryAgents: {
                    select: {
                        deliveryAgent: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                    },
                },
                inquiryClients: {
                    select: {
                        client: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                    },
                },
                inquiryGovernorates: true,
                inquiryStatuses: true,
            },
        });
        return {
            inquiryBranches: employee?.inquiryBranches.map((branch) => {
                return branch.branch.id;
            }),
            inquiryLocations: employee?.inquiryLocations.map((location) => {
                return location.location.id;
            }),
            inquiryCompanies: employee?.inquiryCompanies.map((company) => {
                return company.company.id;
            }),
            inquiryStores: employee?.inquiryStores.map((store) => {
                return store.store.id;
            }),
            inquiryClients: employee?.inquiryClients.map((client) => {
                return client.client.user.id;
            }),
            inquiryDeliveryAgents: employee?.inquiryDeliveryAgents.map((agent) => {
                return agent.deliveryAgent.user.id;
            }),
            inquiryGovernorates: employee?.inquiryGovernorates,
            inquiryStatuses: employee?.inquiryStatuses,
            orderType: employee?.orderType,
        };
    }
    async getEmployee(data) {
        const employee = await db_1.prisma.employee.findUnique({
            where: {
                id: data.employeeID,
            },
            select: employees_responses_1.employeeSelect,
        });
        return (0, employees_responses_1.employeeReform)(employee);
    }
    async updateEmployee(data) {
        const employee = await db_1.prisma.employee.update({
            where: {
                id: data.employeeID,
            },
            data: {
                user: {
                    update: {
                        name: data.employeeData.name,
                        username: data.employeeData.username,
                        password: data.employeeData.password,
                        phone: data.employeeData.phone,
                        fcm: data.employeeData.fcm,
                        avatar: data.employeeData.avatar,
                    },
                },
                idCard: data.employeeData.idCard,
                residencyCard: data.employeeData.residencyCard,
                clientAssistantRole: data.employeeData.clientAssistantRole,
                orderType: data.employeeData.orderType,
                salary: data.employeeData.salary,
                role: data.employeeData.role === "EMERGENCY_EMPLOYEE" ||
                    data.employeeData.role === "MAIN_EMERGENCY_EMPLOYEE"
                    ? "INQUIRY_EMPLOYEE"
                    : data.employeeData.role,
                emergency: data.employeeData.role === "EMERGENCY_EMPLOYEE" ? true : false,
                mainEmergency: data.employeeData.role === "MAIN_EMERGENCY_EMPLOYEE" ? true : false,
                permissions: data.employeeData.permissions,
                orderStatus: data.employeeData.orderStatus,
                branch: data.employeeData.branchID
                    ? {
                        connect: {
                            id: data.employeeData.branchID,
                        },
                    }
                    : undefined,
                repository: data.employeeData.repositoryID
                    ? {
                        connect: {
                            id: data.employeeData.repositoryID,
                        },
                    }
                    : undefined,
                inquiryClients: data.employeeData.inquiryClientsIDs
                    ? {
                        deleteMany: {
                            agentId: data.employeeID,
                        },
                        create: data.employeeData.inquiryClientsIDs.map((clientId) => {
                            return {
                                client: {
                                    connect: {
                                        id: clientId,
                                    },
                                },
                            };
                        }),
                    }
                    : undefined,
                inquiryStores: data.employeeData.inquiryStoresIDs
                    ? {
                        deleteMany: {
                            inquiryEmployeeId: data.employeeID,
                        },
                        create: data.employeeData.inquiryStoresIDs.map((storeID) => {
                            return {
                                store: {
                                    connect: {
                                        id: storeID,
                                    },
                                },
                            };
                        }),
                    }
                    : data.employeeData.storesIDs
                        ? {
                            deleteMany: {
                                inquiryEmployeeId: data.employeeID,
                            },
                            create: data.employeeData.storesIDs.map((storeID) => {
                                return {
                                    store: {
                                        connect: {
                                            id: storeID,
                                        },
                                    },
                                };
                            }),
                        }
                        : undefined,
                inquiryBranches: data.employeeData.inquiryBranchesIDs
                    ? {
                        deleteMany: {
                            inquiryEmployeeId: data.employeeID,
                        },
                        createMany: {
                            data: data.employeeData.inquiryBranchesIDs.map((branchID) => {
                                return {
                                    branchId: branchID,
                                };
                            }),
                        },
                    }
                    : undefined,
                inquiryCompanies: data.employeeData.inquiryCompaniesIDs
                    ? {
                        deleteMany: {
                            inquiryEmployeeId: data.employeeID,
                        },
                        createMany: {
                            data: data.employeeData.inquiryCompaniesIDs.map((companyID) => {
                                return {
                                    companyId: companyID,
                                };
                            }),
                        },
                    }
                    : undefined,
                inquiryGovernorates: data.employeeData.inquiryGovernorates
                    ? {
                        set: data.employeeData.inquiryGovernorates,
                    }
                    : undefined,
                inquiryStatuses: data.employeeData.inquiryStatuses
                    ? {
                        set: data.employeeData.inquiryStatuses,
                    }
                    : undefined,
                inquiryLocations: data.employeeData.inquiryLocationsIDs
                    ? {
                        deleteMany: {
                            inquiryEmployeeId: data.employeeID,
                        },
                        createMany: {
                            data: data.employeeData.inquiryLocationsIDs.map((locationID) => {
                                return {
                                    locationId: locationID,
                                };
                            }),
                        },
                    }
                    : undefined,
            },
            select: employees_responses_1.employeeSelect,
        });
        await db_1.prisma.inquiryEmployeesDeliveryAgents.deleteMany({
            where: {
                inquiryEmployeeId: data.employeeID,
            },
        });
        console.log("inquiryDeliveryAgentsIDs", data.employeeData.inquiryDeliveryAgentsIDs);
        if (data.employeeData.inquiryDeliveryAgentsIDs?.length) {
            await db_1.prisma.inquiryEmployeesDeliveryAgents.createMany({
                data: data.employeeData.inquiryDeliveryAgentsIDs.map((id) => ({
                    deliveryAgentId: id,
                    inquiryEmployeeId: data.employeeID,
                })),
            });
        }
        return (0, employees_responses_1.employeeReform)(employee);
    }
    async deleteEmployee(data) {
        await db_1.prisma.$transaction([
            db_1.prisma.employee.delete({
                where: {
                    id: data.employeeID,
                },
            }),
            db_1.prisma.user.delete({
                where: {
                    id: data.employeeID,
                },
            }),
        ]);
        return true;
    }
    async deactivateEmployee(data) {
        const deletedEmployee = await db_1.prisma.employee.update({
            where: {
                id: data.employeeID,
            },
            data: {
                deleted: true,
                deletedAt: new Date(),
                deletedBy: {
                    connect: {
                        id: data.deletedByID,
                    },
                },
            },
        });
        return deletedEmployee;
    }
    async reactivateEmployee(data) {
        const deletedEmployee = await db_1.prisma.employee.update({
            where: {
                id: data.employeeID,
            },
            data: {
                deleted: false,
            },
        });
        return deletedEmployee;
    }
    async getCompanyManager(data) {
        const companyManager = await db_1.prisma.employee.findFirst({
            where: {
                role: "COMPANY_MANAGER",
                company: {
                    id: data.companyID,
                },
            },
            orderBy: {
                id: "asc",
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return {
            id: companyManager?.user.id,
            name: companyManager?.user.name,
        };
    }
    // TODO: Move to Employees repository
    async getDeliveryAgentIDByLocationID(data) {
        const deliveryAgent = await db_1.prisma.employee.findFirst({
            where: {
                role: "DELIVERY_AGENT",
                deliveryAgentsLocations: {
                    some: {
                        locationId: data.locationID,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        return deliveryAgent?.id;
    }
}
exports.EmployeesRepository = EmployeesRepository;
//# sourceMappingURL=employees.repository.js.map