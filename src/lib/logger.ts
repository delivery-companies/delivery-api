import winston from "winston";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// const level = () => {
//     const env = env.NODE_ENV || "dev";
//     const isDevelopment = env === "dev";
//     return isDevelopment ? "debug" : "warn";
// };

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white"
};

winston.addColors(colors);

const format = winston.format.combine(
    // stack true
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        let message = "";
        // if (info.message.includes("Request->")) {
        //     message += `${"∧".repeat(100)}\n`;
        // }
        message += `${info.timestamp} ${info.level}: ${info.message}`;
        if (info.stack) {
            message += `\n\n------------------------------\n\n${info.stack}`;
        }
        // if (info.message.includes("Response->")) {
        //     message += `\n${"∨".repeat(100)}`;
        // } else {
        //     message += "\n------------------------------------------------------------";
        // }
        message +=
            "\n\n------------------------------------------------------------------------------------------\n";
        return message;
        // return `${info.level === "http" ? "^^^^^^^^^^^^^^^^^" : ""}${info.timestamp} ${info.level}: ${
        //     info.message
        // }${
        //     info.stack ? `\n------------------------------\n${info.stack}` : ""
        // }\n------------------------------------------------------------`;
    })
);

const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: "logs/error.log",
        level: "error"
    }),
    new winston.transports.File({ filename: "logs/all.log" })
];

export const Logger = winston.createLogger({
    level: "debug",
    levels,
    format,
    transports
});
