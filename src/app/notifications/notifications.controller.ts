import {AppError} from "../../lib/AppError";
import {catchAsync} from "../../lib/catchAsync";
import {NotificationUpdateSchema} from "./notifications.dto";
import {NotificationsRepository} from "./notifications.repository";

const notificationsRepository = new NotificationsRepository();

export class NotificationsController {
  getAllNotifications = catchAsync(async (req, res) => {
    const userID = +res.locals.user.id as number;
    let seen = true;
    if (req.query.unRead && req.query.unRead === "true") {
      seen = false;
    }

    let size = req.query.size ? +req.query.size : 10;
    if (size > 500) {
      size = 10;
    }
    let page = 1;
    if (
      req.query.page &&
      !Number.isNaN(+req.query.page) &&
      +req.query.page > 0
    ) {
      page = +req.query.page;
    }

    const {notifications, pagesCount, unSeenCount} =
      await notificationsRepository.getAllNotificationsPaginated(
        userID,
        page,
        size,
        seen
      );

    res.status(200).json({
      status: "success",
      unSeenCount,
      page: page,
      pagesCount: pagesCount,
      data: notifications,
    });
  });

  updateNotification = catchAsync(async (req, res) => {
    const notificationID = +req.params.notificationID;

    if (!notificationID) {
      throw new AppError(" no notificationID", 404);
    }
    const notificationData = NotificationUpdateSchema.parse(req.body);

    const notification = await notificationsRepository.updateNotification({
      notificationID: notificationID,
      notificationData: notificationData,
    });

    res.status(200).json({
      status: "success",
      data: notification,
    });
  });

  updateNotifications = catchAsync(async (req, res) => {
    const notificationData = NotificationUpdateSchema.parse(req.body);

    const userID = +res.locals.user.id as number;

    await notificationsRepository.updateNotifications({
      userID: userID,
      notificationData: notificationData,
    });

    res.status(200).json({
      status: "success",
    });
  });
}
