import type { Prisma } from "@prisma/client";

export const sizeSelect = {
    id: true,
    title: true,
    createdAt: true,
    updatedAt: true,
    clientId:true
    // company: {
    //     select: {
    //         id: true,
    //         name: true
    //     }
    // }
} satisfies Prisma.SizeSelect;

// const sizeSelectReform = (size: Prisma.SizeGetPayload<typeof sizeSelect>) => {
//     return {
//         id: size.id,
//         title: size.title,
//         createdAt: size.createdAt,
//         updatedAt: size.updatedAt
//     };
// };
