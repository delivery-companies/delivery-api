import type { Prisma } from "@prisma/client";

export const productSelect = {
    id: true,
    title: true,
    price: true,
    image: true,
    stock: true,
    weight: true,
    store: {
        select: {
            id: true,
            name: true
        }
    },
    category: {
        select: {
            title: true
        }
    },
    productColors: {
        select: {
            quantity: true,
            color: {
                select: { id: true, title: true, code: true }
            }
        }
    },
    productSizes: {
        select: {
            quantity: true,
            size: {
                select: { id: true, title: true }
            }
        }
    },
    company: {
        select: {
            id: true,
            name: true
        }
    }
} satisfies Prisma.ProductSelect;

// const productSelectReform = (product: Prisma.ProductGetPayload<typeof productSelect>) => {
//     return {
//         id: product.id,
//         title: product.title,
//         price: product.price,
//         image: product.image,
//         stock: product.stock,
//         weight: product.weight,
//         category: product.category.title,
//         colors: product.productColors.map((color) => {
//             return {
//                 id: color.color.id,
//                 title: color.color.title,
//                 quantity: color.quantity
//             };
//         }),
//         sizes: product.productSizes.map((size) => {
//             return {
//                 id: size.size.id,
//                 title: size.size.title,
//                 quantity: size.quantity
//             };
//         })
//     };
// };
