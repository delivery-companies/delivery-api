"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchSelect = void 0;
exports.branchSelect = {
    id: true,
    name: true,
    governorate: true,
    company: {
        select: {
            id: true,
            name: true,
        },
    },
};
// const branchReform = (branch: any) => {
//     return {
//         // TODO
//         id: branch.id,
//         name: branch.name,
//         email: branch.email,
//         phone: branch.phone,
//         governorate: branch.governorate,
//         company: branch.company
//     };
// };
//# sourceMappingURL=branches.responses.js.map