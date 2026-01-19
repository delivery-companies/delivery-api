"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { apiReference } from "@scalar/express-api-reference";
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_body_1 = __importDefault(require("morgan-body"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const AppError_1 = require("./lib/AppError");
const logger_1 = require("./lib/logger");
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const morgan_1 = require("./middlewares/morgan");
const routes_1 = __importDefault(require("./routes"));
const swagger_output_json_1 = __importDefault(require("./swagger/swagger-output.json"));
const app = (0, express_1.default)();
app.options("*", (0, cors_1.default)()); // include before other routes
app.use((0, cors_1.default)());
const swaggerOptionsV1 = {
    explorer: true,
    // customCss: swaggerTheme.getBuffer("dark"),
};
app.use("/api-docs-dark-theme", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default, swaggerOptionsV1));
app.use(body_parser_1.default.json()); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(body_parser_1.default.urlencoded({ extended: true })); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use((0, cookie_parser_1.default)()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(morgan_1.morganMiddlewareImmediate);
(0, morgan_body_1.default)(app, {
    stream: {
        // @ts-expect-error Fix later
        write: (message) => logger_1.Logger.info(message.replace(/\n$/, "")),
    },
    maxBodyLength: 200,
    immediateReqLog: true,
    // theme: "lightened",
    noColors: true,
    prettify: false,
});
app.use(morgan_1.morganMiddleware);
app.use((0, compression_1.default)({
    filter: (req, res) => {
        const contentType = res.getHeader("Content-Type");
        // Do not gzip PDFs
        if (contentType && contentType.toString().includes("application/pdf")) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    threshold: 0,
}));
app.use("/static", express_1.default.static("static"));
app.use("/logs", 
// isLoggedIn,
// isAutherized([Role.ADMIN]),
express_1.default.static("logs"));
// Routes
app.disable("etag");
app.use("/api/v1", routes_1.default);
app.route("/").get((_req, res) => {
    // #swagger.ignore = true
    res.send("<h1>Hello, World! 🌍 [From Root]</h1>");
});
app.route("/api").get((_req, res) => {
    // #swagger.ignore = true
    res.send("<h1>Hello, World! 🌍 [From API]</h1>");
});
app.route("/health").get((_req, res) => {
    // #swagger.ignore = true
    res.sendStatus(200);
});
app.all("*", (req, _res, next) => {
    // #swagger.ignore = true
    // Logger.error(`Can't find ${req.originalUrl} on this server!`);
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use(globalErrorHandler_1.default);
// Export App
exports.default = app;
//# sourceMappingURL=app.js.map