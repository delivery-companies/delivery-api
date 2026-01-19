"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSelect = void 0;
exports.transactionSelect = {
    id: true,
    type: true,
    for: true,
    paidAmount: true,
    employee: {
        select: {
            user: {
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
    company: {
        select: {
            id: true,
            name: true,
        },
    },
    createdAt: true,
    updatedAt: true,
};
//# sourceMappingURL=transactions.responses.js.map