import {Request, Response, NextFunction} from "express";
import {loggedInUserType} from "../types/user";

const requestCache = new Map<string, number>();
const TIMEOUT = 5000; // ms

export function preventDuplicateRequests(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = res.locals.user as loggedInUserType;

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
