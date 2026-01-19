"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = __importDefault(require("zod"));
dotenv_1.default.config();
const schema = zod_1.default.object({
    PORT: zod_1.default.coerce.number().min(1).max(65535),
    NODE_ENV: zod_1.default.enum(["production", "development"]),
    PASSWORD_SALT: zod_1.default.string().min(1),
    ACCESS_TOKEN_SECRET: zod_1.default.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN: zod_1.default.string().min(1),
    REFRESH_TOKEN_SECRET: zod_1.default.string().min(1),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.default.string().min(1),
    DB_NAME: zod_1.default.string().min(1),
    DB_PASSWORD: zod_1.default.string().min(1),
    DB_USER: zod_1.default.string().min(1),
    DATABASE_URL: zod_1.default.string().min(1).url(),
    FIREBASE_PROJECT_ID: zod_1.default.string().min(1),
    FIREBASE_CLIENT_EMAIL: zod_1.default.string().min(1),
    FIREBASE_PRIVATE_KEY: zod_1.default.string().min(1),
    DO_SPACES_BUCKET_NAME: zod_1.default.string().min(1),
    DO_SPACES_REGION: zod_1.default.string().min(1),
    DO_SPACES_ENDPOINT: zod_1.default.string().min(1),
    DO_SPACES_KEY: zod_1.default.string().min(1),
    DO_SPACES_SECRET: zod_1.default.string().min(1),
});
exports.env = schema.parse(process.env);
//# sourceMappingURL=index.js.map