"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.automaticUpdatesCronJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const automaticUpdatesTask_1 = require("../app/automatic-updates/tasks/automaticUpdatesTask");
const logger_1 = require("../lib/logger");
exports.automaticUpdatesCronJob = node_cron_1.default.schedule("0 * * * *", 
// every minute
// "* * * * *",
async () => {
    logger_1.Logger.info("Running automatic updates");
    await (0, automaticUpdatesTask_1.automaticUpdatesTask)();
}, {
    scheduled: false,
    timezone: "Asia/Baghdad",
});
//# sourceMappingURL=automaticUpdatesCronJob.js.map