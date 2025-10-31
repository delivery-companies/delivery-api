// import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

export const UserSigninSchema = z.object({
    username: z.string(),
    password: z.string(),
    fcm: z.string().optional(),
    ip: z.string().optional(),
    location: z.string().optional(),
    device: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional()
    // type: z.nativeEnum(LoginType).optional()
});

export type UserSigninType = z.infer<typeof UserSigninSchema>;

export const UserSigninOpenAPISchema = generateSchema(UserSigninSchema);

// export const UserSigninMock = generateMock(UserSigninSchema);

export const RefreshTokenSchema = z.object({
    refreshToken: z.string()
});

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;

// export const RefreshTokenOpenAPISchema = generateSchema(RefreshTokenSchema);

// export const RefreshTokenMock = generateMock(RefreshTokenSchema);
