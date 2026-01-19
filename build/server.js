"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const automaticUpdatesCronJob_1 = require("./cron-jobs/automaticUpdatesCronJob");
const logger_1 = require("./lib/logger");
const address = `http://localhost:${config_1.env.PORT}`;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
// import {automaticBackUpCronJob} from "./backup";
const newServer = http_1.default.createServer(app_1.default);
// Middlewares
exports.io = new socket_io_1.Server(newServer, {
    cors: {
        origin: "*", // or whatever port your frontend runs on
        credentials: true,
    },
});
exports.io.on("connection", (socket) => {
    socket.emit("newConnect", { message: "you are connected" });
    console.log("✅ User connected:", socket.id);
    socket.on("joinChat", async (data) => {
        socket.join(`chat_${data.orderId}`);
        socket.join(`${data.userId}`);
        console.log(`Socket ${socket.id} joined room chat_${data.orderId}`);
    });
    socket.on("saveUserId", (data) => {
        socket.join(`${data.userId}`);
    });
    // Leave room
    socket.on("leaveChat", (orderId) => {
        socket.leave(`chat_${orderId}`);
    });
    socket.on("disconnect", () => {
        console.log("🔥 Client disconnected:", socket.id);
    });
});
const server = newServer.listen(config_1.env.PORT, () => {
    console.info("------------------------------------------------------------------------------------------\n");
    logger_1.Logger.debug(`Starting APP On -> ${address}`);
    automaticUpdatesCronJob_1.automaticUpdatesCronJob.start();
    // automaticBackUpCronJob.start();
});
process.on("uncaughtException", (err) => {
    // console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    // console.log(err.name, "\n", err.message);
    logger_1.Logger.error("💥 UNCAUGHT EXCEPTION! 💥 Shutti ng down... 💥");
    logger_1.Logger.error(`${err.name}\n${err.message}`);
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    // console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    // console.log(err.name, err.message);
    logger_1.Logger.error("💥 UNHANDLED REJECTION! 💥 Shutting down... 💥");
    logger_1.Logger.error(`${err.name}\n${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
//# sourceMappingURL=server.js.map