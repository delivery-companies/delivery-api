import type { Prisma } from "@prisma/client";

export const userSelect = {
    id: true,
    avatar: true,
    name: true,
    username: true,
    phone: true,
    employee: {
        select: {
            role: true,
            permissions: true,
            orderStatus: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    color: true
                }
            }
        }
    },
    client: {
        select: {
            role: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    color: true
                }
            }
        }
    },
    admin: {
        select: {
            // phone: true,
            role: true
        }
    }
} satisfies Prisma.UserSelect;

export const userSelectReform = (
    user: Prisma.UserGetPayload<{
        select: typeof userSelect;
    }> | null
) => {
    if (!user) {
        throw new Error("لم يتم العثور على المستخدم");
    }
    return {
        id: user.id,
        avatar: user.avatar || "",
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.employee?.role || user.client?.role || user.admin?.role || "",
        company: user.employee?.company || user.client?.company || null,
        permissions: user.employee?.permissions || [],
        orderStatus: user.employee?.orderStatus || []
    };
};

export const userLoginHistorySelect = {
    id: true,
    ip: true,
    device: true,
    platform: true,
    browser: true,
    location: true,
    createdAt: true,
    user: {
        select: {
            id: true,
            name: true,
            username: true,
            employee: {
                select: {
                    role: true
                }
            },
            client: {
                select: {
                    role: true
                }
            },
            admin: {
                select: {
                    role: true
                }
            }
        }
    },
    company: {
        select: {
            id: true,
            name: true
        }
    }
} satisfies Prisma.UsersLoginHistorySelect;

export const userLoginHistorySelectReform = (
    loginHistory: Prisma.UsersLoginHistoryGetPayload<{
        select: typeof userLoginHistorySelect;
    }>
) => {
    return {
        id: loginHistory.id,
        ip: loginHistory.ip,
        device: loginHistory.device,
        platform: loginHistory.platform,
        browser: loginHistory.browser,
        location: loginHistory.location,
        createdAt: loginHistory.createdAt,
        user: {
            id: loginHistory.user.id,
            name: loginHistory.user.name,
            username: loginHistory.user.username,
            role: loginHistory.user.employee?.role || loginHistory.user.client?.role || loginHistory.user.admin?.role || "",
            company: loginHistory.company
        }
    };
};
