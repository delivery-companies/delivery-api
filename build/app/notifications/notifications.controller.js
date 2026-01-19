"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const AppError_1 = require("../../lib/AppError");
const catchAsync_1 = require("../../lib/catchAsync");
const notifications_dto_1 = require("./notifications.dto");
const notifications_repository_1 = require("./notifications.repository");
const notificationsRepository = new notifications_repository_1.NotificationsRepository();
class NotificationsController {
    getAllNotifications = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const userID = +res.locals.user.id;
        let seen = true;
        if (req.query.unRead && req.query.unRead === "true") {
            seen = false;
        }
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
        const { notifications, pagesCount, unSeenCount } = await notificationsRepository.getAllNotificationsPaginated(userID, page, size, seen);
        res.status(200).json({
            status: "success",
            unSeenCount,
            page: page,
            pagesCount: pagesCount,
            data: notifications,
        });
    });
    updateNotification = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const notificationID = +req.params.notificationID;
        if (!notificationID) {
            throw new AppError_1.AppError(" no notificationID", 404);
        }
        const notificationData = notifications_dto_1.NotificationUpdateSchema.parse(req.body);
        const notification = await notificationsRepository.updateNotification({
            notificationID: notificationID,
            notificationData: notificationData,
        });
        res.status(200).json({
            status: "success",
            data: notification,
        });
    });
    updateNotifications = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const notificationData = notifications_dto_1.NotificationUpdateSchema.parse(req.body);
        const userID = +res.locals.user.id;
        await notificationsRepository.updateNotifications({
            userID: userID,
            notificationData: notificationData,
        });
        res.status(200).json({
            status: "success",
        });
    });
}
exports.NotificationsController = NotificationsController;
//# sourceMappingURL=notifications.controller.js.map