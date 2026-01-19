"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiClient = void 0;
const AppError_1 = require("../lib/AppError");
const db_1 = require("../database/db");
const crypto_1 = __importDefault(require("crypto"));
const isApiClient = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Api-Key ")) {
        return next(new AppError_1.AppError("API Key required", 401));
    }
    const apiKey = auth.replace("Api-Key ", "").trim();
    const apiKeyHash = crypto_1.default.createHash("sha256").update(apiKey).digest("hex");
    const client = await db_1.prisma.client.findFirst({
        where: { apiKeyHash },
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
    };
    // GRANT ACCESS
    next();
};
exports.isApiClient = isApiClient;
//# sourceMappingURL=isApiClient.js.map