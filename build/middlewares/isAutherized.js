"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAutherized = void 0;
const AppError_1 = require("../lib/AppError");
const isAutherized = (allowedRoles, allowedPermissions) => {
    return (_req, res, next) => {
        const { role, permissions } = res.locals.user;
        if (res.locals.user && allowedRoles.includes(role)) {
            return next();
        }
        if (res.locals.user && allowedPermissions && permissions) {
            const allowed = allowedPermissions.every((permission) => permissions.includes(permission));
            if (allowed) {
                return next();
            }
        }
        return next(new AppError_1.AppError("ليس مصرح لك القيام بهذا الفعل", 403));
    };
};
exports.isAutherized = isAutherized;
//# sourceMappingURL=isAutherized.js.map