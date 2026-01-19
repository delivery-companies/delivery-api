"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const AppError_1 = require("../lib/AppError");
const isLoggedIn = (req, res, next) => {
    try {
        let token;
        // IS USER LOGGED IN
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        else {
            return next(new AppError_1.AppError("الرجاء تسجيل الدخول", 401));
        }
        // IS TOKEN VALID
        const { id, name, username, role, permissions, companyID, companyName, mainCompany, clientId, branchId, mainRepository, repositoryId, } = jsonwebtoken_1.default.verify(token, config_1.env.ACCESS_TOKEN_SECRET);
        // TODO: Check if user still exists
        // TODO: Check if user changed password after the token was issued
        // req.user = { id, email, subdomain, role };
        res.locals.user = {
            id,
            name,
            username,
            role,
            permissions,
            companyID,
            companyName,
            mainCompany,
            clientId,
            branchId,
            mainRepository,
            repositoryId,
        };
        // GRANT ACCESS
        return next();
    }
    catch (err) {
        return next(new AppError_1.AppError("الرجاء تسجيل الدخول", 401));
    }
};
exports.isLoggedIn = isLoggedIn;
//# sourceMappingURL=isLoggedIn.js.map