"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorySelect = void 0;
exports.repositorySelect = {
    id: true,
    name: true,
    branch: true,
    mainRepository: true,
    type: true,
    company: {
        select: {
            id: true,
            name: true
        }
    }
};
// const repositorySelectReform = (
//     repository: Prisma.RepositoryGetPayload<typeof repositorySelect>
// ) => {
//     return {
//         id: repository.id,
//         name: repository.name,
//         branch: repository.branch
//     };
// };
//# sourceMappingURL=repositories.responses.js.map