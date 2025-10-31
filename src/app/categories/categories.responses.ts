import type { Prisma } from "@prisma/client";

export const categorySelect = {
    id: true,
    title: true,
    createdAt: true,
    updatedAt: true
    // company: {
    //     select: {
    //         id: true,
    //         name: true
    //     }
    // }
} satisfies Prisma.CategorySelect;

// const categoryReform = (category: any) => {
//     return {
//         id: category.id,
//         title: category.title,
//         createdAt: category.createdAt,
//         updatedAt: category.updatedAt
//     };
// };
