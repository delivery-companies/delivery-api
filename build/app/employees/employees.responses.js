"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeReform = exports.employeeSelect = void 0;
exports.employeeSelect = {
    salary: true,
    role: true,
    permissions: true,
    orderStatus: true,
    branch: true,
    repository: true,
    deliveryCost: true,
    idCard: true,
    residencyCard: true,
    clientAssistantRole: true,
    emergency: true,
    mainEmergency: true,
    orderType: true,
    user: {
        select: {
            id: true,
            name: true,
            username: true,
            phone: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        },
    },
    company: {
        select: {
            id: true,
            name: true,
            logo: true,
            color: true,
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
    _count: {
        select: {
            orders: true,
        },
    },
    managedStores: {
        select: {
            id: true,
            name: true,
            clientId: true,
        },
    },
    inquiryBranches: {
        select: {
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    inquiryLocations: {
        select: {
            location: {
                select: {
                    id: true,
                    name: true,
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
                            name: true,
                        },
                    },
                },
            },
        },
    },
    inquiryCompanies: {
        select: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    inquiryStores: {
        select: {
            store: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    createdBy: {
        select: {
            id: true,
            name: true,
        },
    },
    inquiryDeliveryAgents: {
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
    },
    // inquiryEmployees: {
    //     select: {
    //         inquiryEmployee: {
    //             select: {
    //                 user: {
    //                     select: {
    //                         id: true,
    //                         name: true
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },
    inquiryGovernorates: true,
    inquiryStatuses: true,
};
const employeeReform = (employee) => {
    if (!employee) {
        return null;
    }
    return {
        // TODO
        id: employee.user.id,
        name: employee.user.name,
        orderType: employee.orderType,
        username: employee.user.username,
        phone: employee.user.phone,
        avatar: employee.user.avatar,
        idCard: employee.idCard,
        residencyCard: employee.residencyCard,
        clientAssistantRole: employee.clientAssistantRole,
        salary: employee.salary,
        role: employee.role,
        emergency: employee.emergency,
        mainEmergency: employee.mainEmergency,
        permissions: employee.permissions,
        orderStatus: employee.orderStatus,
        deliveryCost: employee.deliveryCost,
        branch: employee.branch,
        repository: employee.repository,
        company: employee.company,
        deleted: employee.deleted,
        deletedBy: employee.deleted && employee.deletedBy,
        deletedAt: employee.deletedAt?.toISOString(),
        ordersCount: employee._count.orders,
        createdAt: employee.user.createdAt.toISOString(),
        updatedAt: employee.user.updatedAt.toISOString(),
        managedStores: employee.inquiryStores.map((store) => {
            return store.store;
        }),
        inquiryBranches: employee.inquiryBranches.map((branch) => {
            return branch.branch;
        }),
        inquiryLocations: employee.inquiryLocations.map((location) => {
            return location.location;
        }),
        inquiryCompanies: employee.inquiryCompanies.map((company) => {
            return company.company;
        }),
        inquiryStores: employee.inquiryStores.map((store) => {
            return store.store;
        }),
        inquiryClients: employee.inquiryClients.map((client) => {
            return client.client.user;
        }),
        inquiryDeliveryAgents: employee.inquiryDeliveryAgents.map((deliveryAgent) => {
            return deliveryAgent.deliveryAgent.user;
        }),
        // inquiryEmployees: employee.inquiryEmployees.map((inquiryEmployee) => {
        //     return inquiryEmployee.inquiryEmployee.user;
        // }),
        inquiryGovernorates: employee.inquiryGovernorates,
        inquiryStatuses: employee.inquiryStatuses,
        createdBy: employee.createdBy,
        // deliveryAgentsLocationsCount: employee._count.deliveryAgentsLocations
    };
};
exports.employeeReform = employeeReform;
//# sourceMappingURL=employees.responses.js.map