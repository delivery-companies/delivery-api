"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSkip = exports.calculatePagesCount = void 0;
const calculatePagesCount = (total, perPage) => {
    return Math.ceil(total / perPage) || 1;
};
exports.calculatePagesCount = calculatePagesCount;
const calculateSkip = (page, perPage) => {
    return (page - 1) * perPage;
};
exports.calculateSkip = calculateSkip;
//# sourceMappingURL=pagination.js.map