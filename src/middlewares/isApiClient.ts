import type {NextFunction, Request, Response} from "express";
import {AppError} from "../lib/AppError";
import type {loggedInUserType} from "../types/user";
import {prisma} from "../database/db";
import crypto from "crypto";

export const isApiClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Api-Key ")) {
    return next(new AppError("API Key required", 401));
  }

  const apiKey = auth.replace("Api-Key ", "").trim();

  const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  const client = await prisma.client.findFirst({
    where: {apiKeyHash},
    select: {
      companyId: true,
      role: true,
      branchId: true,
      company: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  res.locals.user = {
    id: client?.user.id,
    name: client?.user.name,
    username: client?.user.username,
    role: client?.role,
    permissions: [],
    companyID: client?.companyId,
    companyName: client?.company.name,
    mainCompany: true,
    clientId: client?.user.id,
    branchId: client?.branchId,
    mainRepository: true,
    repositoryId: 0,
  } as loggedInUserType;

  // GRANT ACCESS
  next();
};
