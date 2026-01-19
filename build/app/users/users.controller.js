"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const catchAsync_1 = require("../../lib/catchAsync");
const users_repository_1 = require("./users.repository");
const usersRepository = new users_repository_1.UsersRepository();
class UsersController {
    getProfile = (0, catchAsync_1.catchAsync)(async (_req, res) => {
        const loggedInUser = res.locals.user;
        const profile = await usersRepository.getUser({
            userID: loggedInUser.id,
        });
        res.status(200).json({
            status: "success",
            data: profile,
        });
    });
    updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const profile = await usersRepository.updateUser({
            userID: loggedInUser.id,
            userData: {
                fcm: req.body.fcm,
            },
        });
        res.status(200).json({
            status: "success",
            data: profile,
        });
    });
    getUsersLoginHistory = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const userID = req.query.user_id ? +req.query.user_id : undefined;
        let size = req.query.size ? +req.query.size : 10;
        if (size > 500) {
            size = 10;
        }
        let page = 1;
        if (req.query.page &&
            !Number.isNaN(+req.query.page) &&
            +req.query.page > 0) {
            page = +req.query.page;
        }
        const { loginHistory, pagesCount } = await usersRepository.getUsersLoginHistoryPaginated({
            loggedInUser: loggedInUser,
            userID,
            filters: {
                page,
                size,
            },
        });
        res.status(200).json({
            status: "success",
            page: page,
            pagesCount: pagesCount,
            data: loginHistory,
        });
    });
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map