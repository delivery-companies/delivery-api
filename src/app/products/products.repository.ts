import type { Prisma } from "@prisma/client";
import { prisma } from "../../database/db";
import type { ProductCreateType, ProductUpdateType } from "./products.dto";
import { productSelect } from "./products.responses";

export class ProductsRepository {
    async createProduct(companyID: number, clientID: number, data: ProductCreateType) {
        const createdProduct = await prisma.product.create({
            data: {
                title: data.title,
                price: data.price,
                image: data.image,
                stock: data.stock,
                store: {
                    connect: {
                        id: data.storeID
                    }
                },
                client: {
                    connect: {
                        id: clientID
                    }
                },
                category: {
                    connect: {
                        id: data.categoryID
                        // create: {
                        //     company: {
                        //         connect: {
                        //             id: companyID
                        //         }
                        //     },
                        //     title: data.category || "أخري"
                        // }
                    }
                },
                productColors: {
                    create: data.colors?.map((color) => {
                        return {
                            quantity: color.quantity,
                            color: {
                                connect: {
                                    id: color.colorID
                                    // create: {
                                    //     company: {
                                    //         connect: {
                                    //             id: companyID
                                    //         }
                                    //     },
                                    //     title: color.title || "أخري"
                                    // }
                                }
                            }
                        };
                    })
                },
                productSizes: {
                    create: data.sizes?.map((size) => {
                        return {
                            quantity: size.quantity,
                            size: {
                                connect: {
                                    id: size.sizeID
                                }
                                //     create: {
                                //         company: {
                                //             connect: {
                                //                 id: companyID
                                //             }
                                //         },
                                //         title: size.title || "أخري"
                                //     }
                                // }
                            }
                        };
                    })
                },
                company: {
                    connect: {
                        id: companyID
                    }
                }
            },
            select: productSelect
        });
        return createdProduct;
    }

    async getAllProductsPaginated(filters: {
        page: number;
        size: number;
        storeID?: number;
        companyID?: number;
        minified?: boolean;
        clientID?: number;
    }) {
        const where = {
            AND: [
                {
                    store: {
                        id: filters.storeID
                    }
                },
                {
                    company: {
                        id: filters.companyID
                    }
                },
                {
                    client: {
                        id: filters.clientID
                    }
                }
            ]
        } satisfies Prisma.ProductWhereInput;

        if (filters.minified === true) {
            const paginatedProducts = await prisma.product.findManyPaginated(
                {
                    where: where,
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        stock: true,
                        productColors: {
                            select: {
                                quantity: true,
                                color: {
                                    select: {
                                        id: true,
                                        title: true
                                    }
                                }
                            }
                        },
                        productSizes: {
                            select: {
                                quantity: true,
                                size: {
                                    select: {
                                        id: true,
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    page: filters.page,
                    size: filters.size
                }
            );
            return { products: paginatedProducts.data, pagesCount: paginatedProducts.pagesCount };
        }

        const paginatedProducts = await prisma.product.findManyPaginated(
            {
                where: where,
                orderBy: {
                    id: "desc"
                },
                select: productSelect
            },
            {
                page: filters.page,
                size: filters.size
            }
        );

        return { products: paginatedProducts.data, pagesCount: paginatedProducts.pagesCount };
    }

    async getProduct(data: { productID: number }) {
        const product = await prisma.product.findUnique({
            where: {
                id: data.productID
            },
            select: productSelect
        });
        return product;
    }

    async updateProduct(data: {
        productID: number;
        companyID: number;
        loggedInUserID: number;
        productData: ProductUpdateType;
    }) {
        const product = await prisma.product.update({
            where: {
                id: data.productID
            },
            data: {
                title: data.productData.title,
                price: data.productData.price,
                image: data.productData.image,
                stock: data.productData.stock,
                store: data.productData.storeID
                    ? {
                          connect: {
                              id: data.productData.storeID
                          }
                      }
                    : undefined,
                // client: {
                //     connect: {
                //         id: data.loggedInUserID
                //     }
                // },
                category: data.productData.categoryID
                    ? {
                          connect: {
                              id: data.productData.categoryID
                              // create: {
                              //     company: {
                              //         connect: {
                              //             id: data.companyID
                              //         }
                              //     },
                              //     title: data.productData.category || "أخري"
                              // }
                          }
                      }
                    : undefined
            },
            //     ProductColors: {
            //         update: data.productData.colors?.map((color) => {
            //             return {
            //                 where: {
            //                     productId_colorId: {
            //                         productId: data.productID,
            //                         colorId: color.colorID
            //                     }
            //                 },
            //                 data: {
            //                     quantity: color.quantity,
            //                     color: {
            //                         connectOrCreate: {
            //                             where: {
            //                                 id: color.colorID
            //                             },
            //                             create: {
            //                                 title: color.title || "أخري"
            //                             }
            //                         }
            //                     }
            //                 }
            //             };
            //         })
            //     },
            //     ProductSizes: {
            //         update: data.productData.sizes?.map((size) => {
            //             return {
            //                 where: {
            //                     productId_sizeId: {
            //                         productId: data.productID,
            //                         sizeId: size.sizeID
            //                     }
            //                 },
            //                 data: {
            //                     quantity: size.quantity,
            //                     size: {
            //                         connectOrCreate: {
            //                             where: {
            //                                 id: size.sizeID
            //                             },
            //                             create: {
            //                                 title: size.title || "أخري"
            //                             }
            //                         }
            //                     }
            //                 }
            //             };
            //         })
            //     }
            // },
            select: productSelect
        });
        return product;
    }

    async deleteProduct(data: { productID: number }) {
        const deletedProductColors = prisma.productColors.deleteMany({
            where: {
                productId: data.productID
            }
        });

        const deletedProductSizes = prisma.productSizes.deleteMany({
            where: {
                productId: data.productID
            }
        });

        const deletedProduct = prisma.product.delete({
            where: {
                id: data.productID
            }
        });

        await prisma.$transaction([deletedProductColors, deletedProductSizes, deletedProduct]);

        return true;
    }
}
