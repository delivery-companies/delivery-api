"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
const sendNotification_1 = require("../notifications/helpers/sendNotification");
const users_repository_1 = require("../users/users.repository");
const auth_dto_1 = require("./auth.dto");
const auth_repository_1 = require("./auth.repository");
const authModel = new auth_repository_1.AuthRepository();
const usersRepository = new users_repository_1.UsersRepository();
class AuthController {
    signin = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = auth_dto_1.UserSigninSchema.parse(req.body);
        const returnedUser = await authModel.signin(user);
        if (!returnedUser) {
            throw new AppError_1.AppError("حطأ في البيانات تاكد من ادخال البيانات بشكل صحيح", 401);
        }
        const isValidPassword = bcrypt_1.default.compareSync(user.password + config_1.env.PASSWORD_SALT, returnedUser.password);
        if (!isValidPassword) {
            throw new AppError_1.AppError("حطأ في البيانات تاكد من ادخال البيانات بشكل صحيح", 401);
        }
        const token = jsonwebtoken_1.default.sign({
            id: returnedUser?.id,
            name: returnedUser.name,
            username: user.username,
            role: returnedUser.role,
            permissions: returnedUser.permissions,
            orderStatus: returnedUser.orderStatus,
            companyID: returnedUser.companyID,
            companyName: returnedUser.companyName,
            mainCompany: returnedUser.mainCompany,
            mainRepository: returnedUser.mainRepository,
            branchId: returnedUser.branchId,
            repositoryId: returnedUser.repositoryId,
            type: returnedUser.type,
            clientId: returnedUser.clientId,
            repository: returnedUser.repository,
        }, config_1.env.ACCESS_TOKEN_SECRET, { expiresIn: config_1.env.ACCESS_TOKEN_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({
            id: returnedUser?.id,
        }, config_1.env.REFRESH_TOKEN_SECRET, { expiresIn: config_1.env.REFRESH_TOKEN_EXPIRES_IN });
        await usersRepository.updateUser({
            userID: returnedUser.id,
            userData: { refreshToken },
        });
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            // expires: JWT_EXPIRES_IN
        });
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(201).json({
            status: "success",
            token: token,
            refreshToken: refreshToken,
        });
        if (user.fcm) {
            await usersRepository.updateUser({
                userID: returnedUser.id,
                userData: { fcm: user.fcm },
            });
        }
        await (0, sendNotification_1.sendNotification)({
            userID: returnedUser.id,
            title: "تم تسجيل الدخول",
            content: "",
        });
        // Update user login history
        await usersRepository.logUserLogin(returnedUser.id, returnedUser.companyID || 0, {
            ip: user.ip,
            device: user.device,
            platform: user.platform,
            browser: user.browser,
            location: user.location,
        });
    });
    refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
        try {
            const refreshToken = auth_dto_1.RefreshTokenSchema.parse(req.body).refreshToken;
            // 1) Check if token is valid
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.env.REFRESH_TOKEN_SECRET);
            // 2) Check if refresh token is in the database
            const refreshTokens = await usersRepository.getUserRefreshTokens(decoded.id);
            if (!refreshTokens || !refreshTokens.includes(refreshToken)) {
                throw new AppError_1.AppError("الرجاء تسجيل الدخول", 401);
            }
            // 3) Create new access token
            const user = await authModel.getUserByID(decoded.id);
            if (!user) {
                throw new AppError_1.AppError("الرجاء تسجيل الدخول", 401);
            }
            const token = jsonwebtoken_1.default.sign({
                id: user?.id,
                name: user.name,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                orderStatus: user.orderStatus,
                companyID: user.companyID,
                companyName: user.companyName,
                mainCompany: user.mainCompany,
                mainRepository: user.mainRepository,
                branchId: user.branchId,
                repositoryId: user.repositoryId,
                type: user.type,
                clientId: user.clientId,
                repository: user.repository,
            }, config_1.env.ACCESS_TOKEN_SECRET, { expiresIn: config_1.env.ACCESS_TOKEN_EXPIRES_IN });
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
                // expires: JWT_EXPIRES_IN
            });
            res.setHeader("Authorization", `Bearer ${token}`);
            res.status(201).json({
                status: "success",
                token: token,
                // refreshToken: newRefreshToken,
            });
        }
        catch (err) {
            throw new AppError_1.AppError("الرجاء تسجيل الدخول", 401);
        }
    });
    signout = (0, catchAsync_1.catchAsync)(async (_req, res) => {
        const user = res.locals.user;
        await authModel.signoutUser(user.id);
        res.clearCookie("jwt");
        res.status(200).json({
            status: "success",
        });
    });
    signoutUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const userID = +req.params.userID;
        await authModel.signoutUser(userID);
        res.status(200).json({
            status: "success",
        });
    });
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map