// middleware/preventDuplicateRequests.ts
import { Request, Response, NextFunction } from "express";
import { loggedInUserType } from "../types/user";

const requestCache = new Map<string, number>();
const TIMEOUT = 5000; // milliseconds

export function preventDuplicateRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = res.locals.user as loggedInUserType;
  const key = `${user.id}:${req.originalUrl}:${JSON.stringify(req.body)}`;

  const now = Date.now();
  const lastRequestTime = requestCache.get(key);

  if (lastRequestTime && now - lastRequestTime < TIMEOUT) {
    return res
      .status(429)
      .json({ error: "Please wait before sending the same request again." });
  }

  requestCache.set(key, now);

  // Optional: auto-clean to prevent memory leak
  setTimeout(() => requestCache.delete(key), TIMEOUT);

  next();
}
