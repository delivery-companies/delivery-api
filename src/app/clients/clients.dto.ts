// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {ClientRole, Governorate} from "@prisma/client";
import {z} from "zod";

export const ClientCreateSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  phone: z.string().min(6),
  role: z.nativeEnum(ClientRole),
  token: z.string().optional(),
  showNumbers: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
  showDeliveryNumber: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
  isExternal: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
  password: z.string().min(6),
  fcm: z.string().optional(),
  branchID: z.coerce.number().optional(),
  repositoryID: z.coerce.number().optional(),
  avatar: z.string().optional(),
  companyID: z.coerce.number().optional(),
  governoratesDeliveryCosts: z
    .preprocess(
      (data) => {
        if (typeof data === "string") {
          return JSON.parse(data);
        }
        return data;
      },
      z.array(
        z.object({
          governorate: z.nativeEnum(Governorate),
          cost: z.coerce.number().max(100000).default(0),
        })
      )
    )
    .optional(),
});

export type ClientCreateType = z.infer<typeof ClientCreateSchema>;

export const ClientCreateOpenAPISchema = generateSchema(ClientCreateSchema);

// export const ClientCreateMock = generateMock(ClientCreateSchema);

export const ClientCreateSchemaWithUserID = ClientCreateSchema.extend({
  userID: z.coerce.number(),
});

export type ClientCreateTypeWithUserID = z.infer<
  typeof ClientCreateSchemaWithUserID
>;

export const ClientUpdateSchema = ClientCreateSchema.partial();

export type ClientUpdateType = z.infer<typeof ClientUpdateSchema>;

export const ClientUpdateOpenAPISchema = generateSchema(ClientUpdateSchema);

// export const ClientUpdateMock = generateMock(ClientUpdateSchema);
