import type { Prisma } from "@prisma/client";

export const colorSelect = {
    id: true,
    title: true,
    code: true,
    clientId:true,
    createdAt: true,
    updatedAt: true
    // company: {
    //     select: {
    //         id: true,
    //         name: true
    //     }
    // }
} satisfies Prisma.ColorSelect;

// export const colorReform = (color: any) => {
//     return {
//         id: color.id,
//         title: color.title,
//         createdAt: color.createdAt,
//         updatedAt: color.updatedAt
//     };
// };
