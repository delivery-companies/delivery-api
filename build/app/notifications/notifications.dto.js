"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationUpdateOpenAPISchema = exports.NotificationUpdateSchema = exports.NotificationCreateSchema = void 0;
// // import { generateMock } from "@anatine/zod-mock";
const zod_openapi_1 = require("@anatine/zod-openapi");
const zod_1 = require("zod");
exports.NotificationCreateSchema = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    seen: zod_1.z.boolean().default(false).optional(),
    userID: zod_1.z.coerce.number(),
    chatId: zod_1.z.coerce.number().optional(),
    orderId: zod_1.z.coerce.string().optional(),
    receiptNumber: zod_1.z.coerce.string().optional(),
    forChat: zod_1.z.boolean().optional(),
});
// export const NotificationCreateOpenAPISchema = generateSchema(
//     NotificationCreateSchema
// );
// export const NotificationCreateMock = generateMock(NotificationCreateSchema);
exports.NotificationUpdateSchema = exports.NotificationCreateSchema.pick({
    seen: true,
}).partial();
exports.NotificationUpdateOpenAPISchema = (0, zod_openapi_1.generateSchema)(exports.NotificationUpdateSchema);
// export const NotificationUpdateMock = generateMock(NotificationUpdateSchema);
//# sourceMappingURL=notifications.dto.js.map