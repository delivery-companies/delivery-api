"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventDuplicateRequests = preventDuplicateRequests;
const requestCache = new Map();
const TIMEOUT = 5000; // ms
function preventDuplicateRequests(req, res, next) {
    const user = res.locals.user;
    if (!user) {
        next();
        return;
    }
    const key = `${user.id}:${req.originalUrl}:${JSON.stringify(req.body)}`;
    const now = Date.now();
    const lastRequestTime = requestCache.get(key);
    if (lastRequestTime && now - lastRequestTime < TIMEOUT) {
        res.status(429).json({
            error: "Please wait before sending the same request again.",
        });
        return; // ✅ important
    }
    requestCache.set(key, now);
    setTimeout(() => {
        requestCache.delete(key);
    }, TIMEOUT);
    next(); // ✅ always end with next()
}
//# sourceMappingURL=preventDuplicateRequests.js.map