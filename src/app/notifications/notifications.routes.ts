import { Router } from "express";

// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { NotificationsController } from "./notifications.controller";

const router = Router();
const notificationsController = new NotificationsController();

router.route("/notifications").get(
    isLoggedIn,
    // isAutherized([Role.ADMIN]),
    notificationsController.getAllNotifications
    /*
        #swagger.tags = ['Notifications Routes']

        #swagger.parameters['page'] = {
            in: 'query',
            description: 'Page Number',
            required: false
        }

        #swagger.parameters['size'] = {
            in: 'query',
            description: 'Page Size (Number of Items per Page) (Default: 10)',
            required: false
        }

        #swagger.parameters['seen'] = {
            in: 'query',
            description: 'Get seen notifications or not ( boolean )',
            required: false
        }
    */
);

router.route("/notifications/:notificationID").patch(
    isLoggedIn,
    // // isAutherized([Role.ADMIN]),
    notificationsController.updateNotification
    /*
        #swagger.tags = ['Notifications Routes']

        #swagger.description = 'Mark a notification as seen'

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    "schema": { $ref: "#/components/schemas/NotificationUpdateSchema" },
                    "examples": {
                        "NotificationUpdateExample": { $ref: "#/components/examples/NotificationUpdateExample" }
                    }
                }
            }
        }
    */
);

router.route("/notifications").patch(
    isLoggedIn,
    // // isAutherized([Role.ADMIN]),
    notificationsController.updateNotifications
    /*
        #swagger.tags = ['Notifications Routes']

        #swagger.description = 'Mark all notifications as seen'

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    "schema": { $ref: "#/components/schemas/NotificationUpdateSchema" },
                    "examples": {
                        "NotificationUpdateExample": { $ref: "#/components/examples/NotificationUpdateExample" }
                    }
                }
            }
        }
    */
);

export default router;
