import { prisma } from "../../database/db";
import type { loggedInUserType } from "../../types/user";
import type { UserSigninType } from "../auth/auth.dto";
import {
    userLoginHistorySelect,
    userLoginHistorySelectReform,
    userSelect,
    userSelectReform
} from "./users.responses";

export class UsersRepository {
    async getUser(data: { userID: number }) {
        const user = await prisma.user.findUnique({
            where: {
                id: data.userID
            },
            select: userSelect
        });
        return userSelectReform(user);
    }

    async updateUser(data: {
        userID: number;
        userData: { fcm?: string; refreshToken?: string; refreshTokens?: string[] };
    }) {
        const user = await prisma.user.update({
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
            select: userSelect
        });
        return userSelectReform(user);
    }

    async getUserRefreshTokens(userID: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: userID
            },
            select: {
                refreshTokens: true
            }
        });
        return user?.refreshTokens;
    }

    async logUserLogin(
        userID: number,
        companyID: number,
        data: Omit<UserSigninType, "username" | "password" | "fcm">
    ) {
        await prisma.usersLoginHistory.create({
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

    async getUsersLoginHistoryPaginated(data: {
        loggedInUser: loggedInUserType;
        userID?: number;
        filters: { page: number; size: number };
    }) {
        const loginHistory = await prisma.usersLoginHistory.findManyPaginated(
            {
                where: {
                    userId: data.userID,
                    companyId: data.loggedInUser.companyID || undefined
                },
                orderBy: {
                    createdAt: "desc"
                },
                select: userLoginHistorySelect
            },
            {
                page: data.filters.page,
                size: data.filters.size
            }
        );
        return {
            loginHistory: loginHistory.data.map(userLoginHistorySelectReform),
            pagesCount: loginHistory.pagesCount
        };
    }
}
