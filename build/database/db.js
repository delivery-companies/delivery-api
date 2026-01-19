"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// import * as util from "node:util";
const client_1 = require("@prisma/client");
// import { Logger } from "../lib/logger";
const pagination_1 = require("../lib/pagination");
const prismaX = new client_1.PrismaClient({
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
exports.prisma = prismaX
    .$extends({
    name: "findManyAndCount",
    model: {
        $allModels: {
            findManyAndCount(args) {
                return exports.prisma.$transaction([
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    this.findMany(args),
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    this.count({ where: args.where })
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                ]);
            }
        }
    }
})
    .$extends({
    name: "findManyPaginated",
    model: {
        $allModels: {
            async findManyPaginated(args, pagination) {
                const data = (await exports.prisma.$transaction([
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    this.findMany({
                        ...args,
                        skip: (0, pagination_1.calculateSkip)(pagination.page, pagination.size),
                        take: pagination.size
                    }),
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    this.count({ where: args.where })
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                ]));
                return {
                    data: data[0],
                    dataCount: data[1],
                    // currentPage: pagination.page,
                    pagesCount: (0, pagination_1.calculatePagesCount)(data[1], pagination.size)
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
//# sourceMappingURL=db.js.map