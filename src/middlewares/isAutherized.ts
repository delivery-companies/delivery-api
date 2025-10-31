import type { AdminRole, ClientRole, EmployeeRole, Permission } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/AppError";
import type { loggedInUserType } from "../types/user";

export const isAutherized = (
    allowedRoles: (AdminRole | EmployeeRole | ClientRole)[],
    allowedPermissions?: Permission[]
) => {
    return (_req: Request, res: Response, next: NextFunction) => {
        const { role, permissions } = res.locals.user as loggedInUserType;
        if (res.locals.user && allowedRoles.includes(role)) {
            return next();
        }
        if (res.locals.user && allowedPermissions && permissions) {
            const allowed = allowedPermissions.every((permission) => permissions.includes(permission));
            if (allowed) {
                return next();
            }
        }
        return next(new AppError("ليس مصرح لك القيام بهذا الفعل", 403));
    };
};
