import type { Prisma } from "@prisma/client";

export const repositorySelect = {
    id: true,
    name: true,
    branch: true,
    mainRepository:true,
    type:true,
    company: {
        select: {
            id: true,
            name: true
        }
    }
} satisfies Prisma.RepositorySelect;

// const repositorySelectReform = (
//     repository: Prisma.RepositoryGetPayload<typeof repositorySelect>
// ) => {
//     return {
//         id: repository.id,
//         name: repository.name,
//         branch: repository.branch
//     };
// };
