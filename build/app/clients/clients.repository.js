"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsRepository = void 0;
const db_1 = require("../../database/db");
const clients_responses_1 = require("./clients.responses");
class ClientsRepository {
    async createClient(companyID, data) {
        const createdUser = await db_1.prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                password: data.password,
                phone: data.phone,
                fcm: data.fcm,
                avatar: data.avatar,
            },
            select: {
                id: true,
            },
        });
        const createdClient = await db_1.prisma.client.create({
            data: {
                // id: createdUser.id,
                user: {
                    connect: {
                        id: createdUser.id,
                    },
                },
                company: {
                    connect: {
                        id: companyID,
                    },
                },
                role: data.role,
                token: data.token,
                showNumbers: data.showNumbers,
                showDeliveryNumber: data.showDeliveryNumber,
                isExternal: data.isExternal,
                branch: data.branchID
                    ? {
                        connect: {
                            id: data.branchID,
                        },
                    }
                    : undefined,
                repository: data.repositoryID
                    ? {
                        connect: {
                            id: data.repositoryID,
                        },
                    }
                    : undefined,
                createdBy: {
                    connect: {
                        id: data.userID,
                    },
                },
                governoratesDeliveryCosts: data.governoratesDeliveryCosts,
            },
            select: clients_responses_1.clientSelect,
        });
        return (0, clients_responses_1.clientReform)(createdClient);
    }
    async getAllClientsPaginated(filters) {
        let clientIDs = [];
        if (filters.loggedInUser?.role === "CLIENT_ASSISTANT") {
            const stores = await db_1.prisma.employee.findMany({
                where: {
                    id: filters.loggedInUser.id,
                },
                select: {
                    managedStores: {
                        select: {
                            clientId: true,
                        },
                    },
                },
            });
            stores.forEach((store) => {
                store.managedStores.forEach((e) => {
                    clientIDs.push(e.clientId);
                });
            });
        }
        const where = {
            AND: [
                { deleted: filters.deleted === "true" },
                { company: { id: filters.companyID } },
                { branch: filters.branchID ? { id: filters.branchID } : undefined },
                { user: { phone: filters.phone } },
                { user: { name: { contains: filters.name } } },
                // TODO
                {
                    stores: filters.storeID ? { some: { id: filters.storeID } } : undefined,
                },
                {
                    AND: filters.loggedInUser?.role === "CLIENT"
                        ? { id: filters.loggedInUser.id }
                        : undefined,
                },
                {
                    AND: filters.loggedInUser?.role === "CLIENT_ASSISTANT"
                        ? { id: { in: clientIDs } }
                        : undefined,
                },
            ],
        };
        if (filters.minified === true) {
            const paginatedClients = await db_1.prisma.client.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            }, {
                page: 1,
                size: 10000,
            });
            return {
                clients: paginatedClients.data.map((client) => {
                    return {
                        id: client.id,
                        name: client.user.name,
                    };
                }),
                pagesCount: paginatedClients.pagesCount,
            };
        }
        const paginatedClients = await db_1.prisma.client.findManyPaginated({
            orderBy: {
                id: "desc",
            },
            where: where,
            select: clients_responses_1.clientSelect,
        }, {
            page: filters.page,
            size: filters.size,
        });
        return {
            clients: paginatedClients.data.map(clients_responses_1.clientReform),
            pagesCount: paginatedClients.pagesCount,
        };
    }
    async getClient(data) {
        const client = await db_1.prisma.client.findUnique({
            where: {
                id: data.clientID,
            },
            select: clients_responses_1.clientSelect,
        });
        return (0, clients_responses_1.clientReform)(client);
    }
    async updateClient(data) {
        const client = await db_1.prisma.client.update({
            where: {
                id: data.clientID,
            },
            data: {
                user: {
                    update: {
                        name: data.clientData.name,
                        username: data.clientData.username,
                        password: data.clientData.password,
                        phone: data.clientData.phone,
                        fcm: data.clientData.fcm,
                        avatar: data.clientData.avatar,
                    },
                },
                role: data.clientData.role,
                token: data.clientData.token,
                showNumbers: data.clientData.showNumbers,
                isExternal: data.clientData.isExternal,
                showDeliveryNumber: data.clientData.showDeliveryNumber,
                branch: data.clientData.branchID
                    ? {
                        connect: {
                            id: data.clientData.branchID,
                        },
                    }
                    : undefined,
                repository: data.clientData.repositoryID
                    ? {
                        connect: {
                            id: data.clientData.repositoryID,
                        },
                    }
                    : undefined,
                governoratesDeliveryCosts: data.clientData.governoratesDeliveryCosts,
            },
            select: clients_responses_1.clientSelect,
        });
        return (0, clients_responses_1.clientReform)(client);
    }
    async deleteClient(data) {
        await db_1.prisma.$transaction([
            db_1.prisma.client.delete({
                where: {
                    id: data.clientID,
                },
            }),
            db_1.prisma.user.delete({
                where: {
                    id: data.clientID,
                },
            }),
        ]);
        return true;
    }
    async deactivateClient(data) {
        const deletedClient = await db_1.prisma.client.update({
            where: {
                id: data.clientID,
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
        return deletedClient;
    }
    async reactivateClient(data) {
        const deletedClient = await db_1.prisma.client.update({
            where: {
                id: data.clientID,
            },
            data: {
                deleted: false,
            },
        });
        return deletedClient;
    }
    async getClientIDByStoreID(data) {
        const store = await db_1.prisma.store.findUnique({
            where: {
                id: data.storeID,
            },
            select: {
                clientId: true,
            },
        });
        return store?.clientId;
    }
}
exports.ClientsRepository = ClientsRepository;
//# sourceMappingURL=clients.repository.js.map