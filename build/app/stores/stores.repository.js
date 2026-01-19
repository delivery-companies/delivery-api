"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresRepository = void 0;
const db_1 = require("../../database/db");
const stores_responses_1 = require("./stores.responses");
class StoresRepository {
    async createStore(companyID, data) {
        const createdStore = await db_1.prisma.store.create({
            data: {
                name: data.name,
                notes: data.notes,
                logo: data.logo,
                company: {
                    connect: {
                        id: companyID,
                    },
                },
                client: {
                    connect: {
                        id: data.clientID,
                    },
                },
                clientAssistant: data.clientAssistantID
                    ? {
                        connect: {
                            id: data.clientAssistantID,
                        },
                    }
                    : undefined,
            },
            select: stores_responses_1.storeSelect,
        });
        return (0, stores_responses_1.storeSelectReform)(createdStore);
    }
    async getAllStoresPaginated(filters) {
        const where = {
            AND: [
                {
                    id: filters.inquiryStoresIDs
                        ? { in: filters.inquiryStoresIDs }
                        : undefined,
                },
                { deleted: filters.deleted === "true" },
                { company: { id: filters.companyID } },
                {
                    client: filters.clientID ? { id: filters.clientID } : undefined,
                },
                {
                    name: filters.name
                        ? {
                            contains: filters.name,
                            mode: "insensitive",
                        }
                        : undefined,
                },
                {
                    clientAssistant: filters.clientAssistantID
                        ? { id: filters.clientAssistantID }
                        : undefined,
                },
                {
                    client: filters.branchID
                        ? { branch: { id: filters.branchID } }
                        : undefined,
                },
            ],
        };
        if (filters.minified === true) {
            const paginatedStores = await db_1.prisma.store.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    name: true,
                    client: {
                        select: {
                            branchId: true,
                        },
                    },
                },
            }, {
                page: 1,
                size: 10000,
            });
            return {
                stores: paginatedStores.data,
                pagesCount: paginatedStores.pagesCount,
            };
        }
        const paginatedStores = await db_1.prisma.store.findManyPaginated({
            where: where,
            orderBy: {
                id: "desc",
            },
            select: stores_responses_1.storeSelect,
        }, {
            page: filters.page,
            size: filters.size,
        });
        return {
            stores: paginatedStores.data.map(stores_responses_1.storeSelectReform),
            pagesCount: paginatedStores.pagesCount,
        };
    }
    async getAllClientStoresPaginated(filters) {
        const where = {
            AND: [
                { deleted: filters.deleted === "true" },
                { company: { id: filters.companyID } },
                {
                    client: filters.clientID ? { id: filters.clientID } : undefined,
                },
                {
                    name: filters.name
                        ? {
                            contains: filters.name,
                            mode: "insensitive",
                        }
                        : undefined,
                },
            ],
        };
        const paginatedStores = await db_1.prisma.store.findManyPaginated({
            where: where,
            select: {
                id: true,
                name: true,
            },
        }, {
            page: 1,
            size: 10000,
        });
        return {
            stores: paginatedStores.data,
            pagesCount: paginatedStores.pagesCount,
        };
    }
    async getStore(data) {
        const store = await db_1.prisma.store.findUnique({
            where: {
                id: data.storeID,
            },
            select: stores_responses_1.storeSelect,
        });
        return (0, stores_responses_1.storeSelectReform)(store);
    }
    async getStoreByClientAssistantId(clientAssistantId) {
        const store = await db_1.prisma.store.findFirst({
            where: {
                clientAssistantId: clientAssistantId,
            },
            select: stores_responses_1.storeSelect,
        });
        return (0, stores_responses_1.storeSelectReform)(store);
    }
    async updateStore(data) {
        const store = await db_1.prisma.store.update({
            where: {
                id: data.storeID,
            },
            data: {
                name: data.storeData.name,
                logo: data.storeData.logo,
                notes: data.storeData.notes,
                client: data.storeData.clientID
                    ? {
                        connect: {
                            id: data.storeData.clientID,
                        },
                    }
                    : undefined,
                clientAssistant: data.storeData.clientAssistantID
                    ? {
                        connect: {
                            id: data.storeData.clientAssistantID,
                        },
                    }
                    : undefined,
            },
            select: stores_responses_1.storeSelect,
        });
        return (0, stores_responses_1.storeSelectReform)(store);
    }
    async deleteStore(data) {
        const deletedStore = await db_1.prisma.store.delete({
            where: {
                id: data.storeID,
            },
        });
        return deletedStore;
    }
    async deactivateStore(data) {
        const deletedStore = await db_1.prisma.store.update({
            where: {
                id: data.storeID,
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
        return deletedStore;
    }
    async reactivateStore(data) {
        const deletedStore = await db_1.prisma.store.update({
            where: {
                id: data.storeID,
            },
            data: {
                deleted: false,
            },
        });
        return deletedStore;
    }
}
exports.StoresRepository = StoresRepository;
//# sourceMappingURL=stores.repository.js.map