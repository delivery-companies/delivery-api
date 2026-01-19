"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: "red",
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => {
    let message = `${info.timestamp} ${info.level}: ${info.message}`;
    if (info.stack) {
        message += `\n\n------------------------------\n\n${info.stack}`;
    }
    message +=
        "\n\n------------------------------------------------------------\n";
    return message;
}));
const transports = [
    new winston_1.default.transports.Console({
        level: "error", // ONLY errors
    }),
    new winston_1.default.transports.File({
        filename: "logs/error.log",
        level: "error", // ONLY errors
    }),
    new winston_1.default.transports.File({
        filename: "logs/all.log",
        level: "error", // ONLY errors
    }),
];
exports.Logger = winston_1.default.createLogger({
    level: "error", // GLOBAL: only error level will be processed
    levels,
    format,
    transports,
});
//# sourceMappingURL=logger.js.map