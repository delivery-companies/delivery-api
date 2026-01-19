"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRepository = void 0;
const db_1 = require("../../database/db");
const products_responses_1 = require("./products.responses");
class ProductsRepository {
    async createProduct(companyID, clientID, data) {
        const createdProduct = await db_1.prisma.product.create({
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
            select: products_responses_1.productSelect
        });
        return createdProduct;
    }
    async getAllProductsPaginated(filters) {
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
        };
        if (filters.minified === true) {
            const paginatedProducts = await db_1.prisma.product.findManyPaginated({
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
            }, {
                page: filters.page,
                size: filters.size
            });
            return { products: paginatedProducts.data, pagesCount: paginatedProducts.pagesCount };
        }
        const paginatedProducts = await db_1.prisma.product.findManyPaginated({
            where: where,
            orderBy: {
                id: "desc"
            },
            select: products_responses_1.productSelect
        }, {
            page: filters.page,
            size: filters.size
        });
        return { products: paginatedProducts.data, pagesCount: paginatedProducts.pagesCount };
    }
    async getProduct(data) {
        const product = await db_1.prisma.product.findUnique({
            where: {
                id: data.productID
            },
            select: products_responses_1.productSelect
        });
        return product;
    }
    async updateProduct(data) {
        const product = await db_1.prisma.product.update({
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
            select: products_responses_1.productSelect
        });
        return product;
    }
    async deleteProduct(data) {
        const deletedProductColors = db_1.prisma.productColors.deleteMany({
            where: {
                productId: data.productID
            }
        });
        const deletedProductSizes = db_1.prisma.productSizes.deleteMany({
            where: {
                productId: data.productID
            }
        });
        const deletedProduct = db_1.prisma.product.delete({
            where: {
                id: data.productID
            }
        });
        await db_1.prisma.$transaction([deletedProductColors, deletedProductSizes, deletedProduct]);
        return true;
    }
}
exports.ProductsRepository = ProductsRepository;
//# sourceMappingURL=products.repository.js.map