// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {z} from "zod";

export const NotificationCreateSchema = z.object({
  title: z.string(),
  content: z.string(),
  seen: z.boolean().default(false).optional(),
  userID: z.coerce.number(),
  chatId: z.coerce.number().optional(),
  orderId: z.coerce.string().optional(),
  receiptNumber: z.coerce.string().optional(),
  forChat: z.boolean().optional(),
});

export type NotificationCreateType = z.infer<typeof NotificationCreateSchema>;

// export const NotificationCreateOpenAPISchema = generateSchema(
//     NotificationCreateSchema
// );

// export const NotificationCreateMock = generateMock(NotificationCreateSchema);

export const NotificationUpdateSchema = NotificationCreateSchema.pick({
  seen: true,
}).partial();

export type NotificationUpdateType = z.infer<typeof NotificationUpdateSchema>;

export const NotificationUpdateOpenAPISchema = generateSchema(
  NotificationUpdateSchema
);

// export const NotificationUpdateMock = generateMock(NotificationUpdateSchema);
