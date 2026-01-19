"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = exports.morganMiddlewareImmediate = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../lib/logger");
// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream = {
    // Use the http severity
    write: (message) => logger_1.Logger.http(message.replace(/\n$/, ""))
};
// Skip all the Morgan http log if the
// application is not running in dev mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
// const skip = () => {
//     const env = env.NODE_ENV || "dev";
//     return env !== "dev";
// };
// Build the morgan middleware
exports.morganMiddlewareImmediate = (0, morgan_1.default)('----->>> Request [ ":method :url" | :user-agent | :remote-addr | :remote-user ]', {
    stream,
    immediate: true
});
exports.morganMiddleware = (0, morgan_1.default)('<<<----- Response [ ":method :url" | :user-agent | :remote-addr | :remote-user | :status | :res[content-length] | :response-time ms ]', 
// ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
{ stream });
//# sourceMappingURL=morgan.js.map