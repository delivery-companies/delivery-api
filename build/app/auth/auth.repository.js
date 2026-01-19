"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const db_1 = require("../../database/db");
const auth_responses_1 = require("./auth.responses");
class AuthRepository {
    async signin(user) {
        const returnedUser = await db_1.prisma.user.findFirst({
            where: {
                username: user.username,
                OR: [
                    {
                        employee: {
                            deleted: false,
                        },
                    },
                    {
                        client: {
                            deleted: false,
                        },
                    },
                ],
            },
            select: auth_responses_1.userSelect,
        });
        return (0, auth_responses_1.userReform)(returnedUser);
    }
    async getUserByID(userID) {
        const returnedUser = await db_1.prisma.user.findUnique({
            where: {
                id: userID,
            },
            select: auth_responses_1.userSelect,
        });
        return (0, auth_responses_1.userReform)(returnedUser);
    }
    async signoutUser(userID) {
        await db_1.prisma.user.update({
            where: {
                id: userID,
            },
            data: {
                refreshTokens: {
                    set: [],
                },
            },
        });
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map