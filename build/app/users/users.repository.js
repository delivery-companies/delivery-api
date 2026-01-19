"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const db_1 = require("../../database/db");
const users_responses_1 = require("./users.responses");
class UsersRepository {
    async getUser(data) {
        const user = await db_1.prisma.user.findUnique({
            where: {
                id: data.userID
            },
            select: users_responses_1.userSelect
        });
        return (0, users_responses_1.userSelectReform)(user);
    }
    async updateUser(data) {
        const user = await db_1.prisma.user.update({
            where: {
                id: data.userID
            },
            data: {
                fcm: data.userData.fcm,
                // Only one session is allowed
                refreshTokens: data.userData.refreshToken
                    ? { set: [data.userData.refreshToken] }
                    : data.userData.refreshTokens
                        ? { set: data.userData.refreshTokens }
                        : undefined
            },
            select: users_responses_1.userSelect
        });
        return (0, users_responses_1.userSelectReform)(user);
    }
    async getUserRefreshTokens(userID) {
        const user = await db_1.prisma.user.findUnique({
            where: {
                id: userID
            },
            select: {
                refreshTokens: true
            }
        });
        return user?.refreshTokens;
    }
    async logUserLogin(userID, companyID, data) {
        await db_1.prisma.usersLoginHistory.create({
            data: {
                user: {
                    connect: {
                        id: userID
                    }
                },
                company: {
                    connect: {
                        id: companyID
                    }
                },
                ip: data.ip,
                device: data.device,
                platform: data.platform,
                browser: data.browser,
                location: data.location
                // type: data.type
            }
        });
    }
    async getUsersLoginHistoryPaginated(data) {
        const loginHistory = await db_1.prisma.usersLoginHistory.findManyPaginated({
            where: {
                userId: data.userID,
                companyId: data.loggedInUser.companyID || undefined
            },
            orderBy: {
                createdAt: "desc"
            },
            select: users_responses_1.userLoginHistorySelect
        }, {
            page: data.filters.page,
            size: data.filters.size
        });
        return {
            loginHistory: loginHistory.data.map(users_responses_1.userLoginHistorySelectReform),
            pagesCount: loginHistory.pagesCount
        };
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=users.repository.js.map