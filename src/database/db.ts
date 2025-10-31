// import * as util from "node:util";
import { PrismaClient, type Prisma } from "@prisma/client";
// import { Logger } from "../lib/logger";
import { calculatePagesCount, calculateSkip } from "../lib/pagination";

const prismaX = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query"
        },
        {
            emit: "event",
            level: "error"
        },
        {
            emit: "event",
            level: "info"
        },
        {
            emit: "event",
            level: "warn"
        }
    ]
});

// prismaX.$use(async (params, next) => {
//     const before = Date.now();
//     const result = await next(params);
//     const after = Date.now();
//     Logger.info(`Query took ${after - before}ms`);
//     return result;
// });

// prismaX.$on("query", (e) => {
//     Logger.info(
//         util.inspect(
//             {
//                 Query: e.query,
//                 Params: e.params,
//                 Duration: e.duration
//             },
//             { showHidden: false, depth: null, colors: true }
//         )
//     );
// });

// prismaX.$on("error", (e) => {
//     Logger.error(
//         util.inspect(
//             {
//                 Error: e.message
//             },
//             { showHidden: false, depth: null, colors: true }
//         )
//     );
// });

// prismaX.$on("info", (e) => {
//     Logger.info(
//         util.inspect(
//             {
//                 Info: e.message
//             },
//             { showHidden: false, depth: null, colors: true }
//         )
//     );
// });

// prismaX.$on("warn", (e) => {
//     Logger.warn(
//         util.inspect(
//             {
//                 Warning: e.message
//             },
//             { showHidden: false, depth: null, colors: true }
//         )
//     );
// });

export const prisma = prismaX
    .$extends({
        name: "findManyAndCount",
        model: {
            $allModels: {
                findManyAndCount<Model, Args>(
                    this: Model,
                    args: Prisma.Exact<Args, Prisma.Args<Model, "findMany">>
                ): Promise<[Prisma.Result<Model, Args, "findMany">, number]> {
                    return prisma.$transaction([
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                        (this as any).findMany(args),
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                        (this as any).count({ where: (args as any).where })
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    ]) as any;
                }
            }
        }
    })
    .$extends({
        name: "findManyPaginated",
        model: {
            $allModels: {
                async findManyPaginated<Model, Args>(
                    this: Model,
                    args: Prisma.Exact<Args, Prisma.Args<Model, "findMany">>,
                    pagination: { page: number; size: number }
                ): Promise<{
                    data: Prisma.Result<Model, Args, "findMany">;
                    dataCount: number;
                    pagesCount: number;
                    currentPage?: number;
                }> {
                    const data = (await prisma.$transaction([
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                        (this as any).findMany({
                            ...(args as object),
                            skip: calculateSkip(pagination.page, pagination.size),
                            take: pagination.size
                        }),
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                        (this as any).count({ where: (args as any).where })
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    ])) as any;
                    return {
                        data: data[0],
                        dataCount: data[1],
                        // currentPage: pagination.page,
                        pagesCount: calculatePagesCount(data[1], pagination.size)
                    };
                }
            }
        }
    });
// .$extends({
//     query: {
//         $allModels: {
//             async $allOperations({ operation, model, args, query }) {
//                 try {
//                     const start = performance.now();
//                     const result = await query(args);
//                     const end = performance.now();
//                     const time = end - start;
//                     Logger.info(
//                         util.inspect(
//                             { model, operation, time, args },
//                             { showHidden: false, depth: null, colors: true }
//                         )
//                         // { model, operation, args, time }
//                     );
//                     return result;
//                 } catch (error) {
//                     Logger.error(
//                         util.inspect(
//                             { model, operation },
//                             { showHidden: false, depth: null, colors: true }
//                         )
//                     );
//                     throw error;
//                 }
//             }
//         }
//     }
// });
