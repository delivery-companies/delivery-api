"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSelectReform = exports.storeSelect = void 0;
exports.storeSelect = {
    id: true,
    name: true,
    notes: true,
    logo: true,
    client: {
        select: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    },
    clientAssistant: {
        select: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    },
    company: {
        select: {
            id: true,
            name: true
        }
    },
    deleted: true,
    deletedAt: true,
    deletedBy: {
        select: {
            id: true,
            name: true
        }
    }
};
const storeSelectReform = (store) => {
    if (!store) {
        return null;
    }
    return {
        id: store.id,
        name: store.name,
        notes: store.notes,
        logo: store.logo,
        client: store.client.user
            ? {
                id: store.client.user.id,
                name: store.client.user.name
            }
            : undefined,
        clientAssistant: store.clientAssistant
            ? {
                id: store.clientAssistant.user.id,
                name: store.clientAssistant.user.name
            }
            : undefined,
        company: store.company,
        deleted: store.deleted,
        deletedBy: store.deleted && store.deletedBy,
        deletedAt: store.deletedAt?.toISOString()
    };
};
exports.storeSelectReform = storeSelectReform;
//# sourceMappingURL=stores.responses.js.map