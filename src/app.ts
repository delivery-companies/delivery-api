// import { apiReference } from "@scalar/express-api-reference";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morganBody from "morgan-body";
import swaggerUi from "swagger-ui-express";
import {AppError} from "./lib/AppError";
import {Logger} from "./lib/logger";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import {
  morganMiddleware,
  morganMiddlewareImmediate,
} from "./middlewares/morgan";
import apiRouter from "./routes";
import swaggerDocument from "./swagger/swagger-output.json";

const app = express();

app.options("*", cors()); // include before other routes

app.use(cors());

const swaggerOptionsV1 = {
  explorer: true,
  // customCss: swaggerTheme.getBuffer("dark"),
};

app.use(
  "/api-docs-dark-theme",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptionsV1)
);

app.use(bodyParser.json()); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.urlencoded({extended: true})); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(morganMiddlewareImmediate);
morganBody(app, {
  stream: {
    // @ts-expect-error Fix later
    write: (message) => Logger.info(message.replace(/\n$/, "")),
  },
  maxBodyLength: 200,
  immediateReqLog: true,
  // theme: "lightened",
  noColors: true,
  prettify: false,
});
app.use(morganMiddleware);
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 0,
  })
);

app.use("/static", express.static("static"));
app.use(
  "/logs",
  // isLoggedIn,
  // isAutherized([Role.ADMIN]),
  express.static("logs")
);

// Routes

app.use("/api/v1", apiRouter);

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
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler

app.use(globalErrorHandler);

// Export App

export default app;
