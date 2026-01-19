"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowser = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("../lib/logger");
let browser = null;
let launching = null;
const getBrowser = async () => {
    if (browser)
        return browser;
    if (launching)
        return launching;
    launching = puppeteer_1.default.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
        ],
    });
    browser = await launching;
    launching = null;
    browser.on("disconnected", () => {
        logger_1.Logger.error("Puppeteer browser disconnected – restarting...");
        browser = null;
    });
    return browser;
};
exports.getBrowser = getBrowser;
setInterval(async () => {
    if (!browser)
        return;
    logger_1.Logger.warn("Restarting Puppeteer browser (maintenance)");
    try {
        await browser.close();
    }
    catch (err) {
        logger_1.Logger.error("Error while closing Puppeteer browser", err);
    }
    finally {
        browser = null;
    }
}, 1000 * 60 * 30);
//# sourceMappingURL=puppeteerInstance.js.map