import type { Prisma } from "@prisma/client";

export const bannerSelect = {
    id: true,
    title: true,
    content: true,
    image: true,
    url: true,
    createdAt: true,
    company: {
        select: {
            id: true,
            name: true
        }
    }
} satisfies Prisma.BannerSelect;

// const bannerReform = (banner: any) => {
//     return {
//         id: banner.id,
//         title: banner.title,
//         content: banner.content,
//         image: banner.image,
//         url: banner.url,
//         createdAt: banner.createdAt,
//         company: banner.company
//     };
// };
