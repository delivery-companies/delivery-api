"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_1 = require("../../../config");
const logger_1 = require("../../../lib/logger");
const notifications_repository_1 = require("../notifications.repository");
const db_1 = require("../../../database/db");
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert({
        projectId: config_1.env.FIREBASE_PROJECT_ID,
        privateKey: config_1.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: config_1.env.FIREBASE_CLIENT_EMAIL,
    }),
});
const notificationsRepository = new notifications_repository_1.NotificationsRepository();
const sendNotification = async (data) => {
    try {
        let createdNotification = null;
        if (!data.content.includes("رساله")) {
            createdNotification = await notificationsRepository.createNotification(data);
        }
        const user = await db_1.prisma.user.findUnique({
            where: {
                id: data.userID,
            },
            select: {
                fcm: true,
            },
        });
        if (!user?.fcm) {
            return;
        }
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: user.fcm,
                sound: "default",
                title: data.title,
                body: data.content,
                data: {
                    message: data.forChat ? "true" : "false",
                    orderId: data.orderId || null,
                    chatId: data.chatId || null,
                    receiptNumber: data.receiptNumber || null,
                    userId: data.userID || null,
                    notificationId: createdNotification ? createdNotification.id : null,
                },
            }),
        });
        await response.json();
    }
    catch (error) {
        logger_1.Logger.error("Error sending message to token:", error);
    }
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=sendNotification.js.map