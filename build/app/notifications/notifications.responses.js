"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationReform = exports.notificationSelect = void 0;
exports.notificationSelect = {
    id: true,
    title: true,
    content: true,
    seen: true,
    createdAt: true,
    receiptNumber: true,
    user: {
        select: {
            id: true,
            fcm: true,
        },
    },
};
const notificationReform = (notification) => {
    if (!notification) {
        return null;
    }
    return {
        id: notification.id,
        title: notification.title,
        content: notification.content,
        seen: notification.seen,
        createdAt: notification.createdAt,
        orderId: notification.receiptNumber,
        user: {
            id: notification.user.id,
            fcm: notification.user.fcm,
        },
    };
};
exports.notificationReform = notificationReform;
//# sourceMappingURL=notifications.responses.js.map