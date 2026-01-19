"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerSelect = void 0;
exports.bannerSelect = {
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
};
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
//# sourceMappingURL=banners.responses.js.map