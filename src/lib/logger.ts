import winston from "winston";

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

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.errors({stack: true}),
  winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss:ms"}),
  winston.format.colorize({all: true}),
  winston.format.printf((info) => {
    let message = `${info.timestamp} ${info.level}: ${info.message}`;
    if (info.stack) {
      message += `\n\n------------------------------\n\n${info.stack}`;
    }
    message +=
      "\n\n------------------------------------------------------------\n";
    return message;
  })
);

const transports = [
  new winston.transports.Console({
    level: "error", // ONLY errors
  }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error", // ONLY errors
  }),
  new winston.transports.File({
    filename: "logs/all.log",
    level: "error", // ONLY errors
  }),
];

export const Logger = winston.createLogger({
  level: "error", // GLOBAL: only error level will be processed
  levels,
  format,
  transports,
});
