// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {
  EmployeeRole,
  Governorate,
  OrderStatus,
  Permission,
} from "@prisma/client";
import {z} from "zod";

export const EmployeeCreateSchema = z.object({
  username: z.string().min(11),
  name: z.string().min(3),
  clientAssistantRole: z.string().optional(),
  password: z.string().min(6),
  phone: z.string().min(11),
  salary: z.coerce.number().min(0).optional(),
  storesIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  repositoryID: z.coerce.number().optional(),
  branchID: z.coerce.number().optional(),
  role: z.nativeEnum(EmployeeRole),
  permissions: z
    .preprocess((data) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return data;
    }, z.array(z.nativeEnum(Permission)))
    .optional(),
  orderStatus: z
    .preprocess((data) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return data;
    }, z.array(z.nativeEnum(OrderStatus)))
    .optional(),
  fcm: z.string().optional(),
  avatar: z.string().optional(),
  idCard: z.string().optional(),
  residencyCard: z.string().optional(),
  orderType: z.string().optional(),
  companyID: z.coerce.number().optional(),
  deliveryCost: z.coerce.number().optional(),
  inquiryBranchesIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  inquiryClientsIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  inquiryLocationsIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  inquiryStoresIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  inquiryCompaniesIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  inquiryDeliveryAgentsIDs: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.coerce.number()).optional())
    .optional(),
  inquiryGovernorates: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.nativeEnum(Governorate)).optional())
    .optional(),
  inquiryStatuses: z
    .preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.nativeEnum(OrderStatus)).optional())
    .optional(),
});

export type EmployeeCreateType = z.infer<typeof EmployeeCreateSchema>;

export const EmployeeCreateOpenAPISchema = generateSchema(EmployeeCreateSchema);

// export const EmployeeCreateMock = generateMock(EmployeeCreateSchema);

/* --------------------------------------------------------------- */

export const EmployeeUpdateSchema = EmployeeCreateSchema.partial();

export type EmployeeUpdateType = z.infer<typeof EmployeeUpdateSchema>;

export const EmployeeUpdateOpenAPISchema = generateSchema(EmployeeUpdateSchema);

// export const EmployeeUpdateMock = generateMock(EmployeeUpdateSchema);

/* --------------------------------------------------------------- */

export const EmployeesFiltersSchema = z
  .object({
    companyID: z.coerce.number().optional(),
    page: z.coerce.number().optional().default(1),
    size: z.coerce.number().optional().default(10),
    ordersStartDate: z.coerce.date().optional(),
    ordersEndDate: z.coerce.date().optional(),
    roles: z.preprocess((val) => {
      if (typeof val === "string") {
        return val.split(",");
      }
      return val;
    }, z.array(z.nativeEnum(EmployeeRole)).optional()),
    permissions: z.preprocess((val) => {
      if (typeof val === "string") {
        return val.split(",");
      }
      return val;
    }, z.array(z.nativeEnum(Permission)).optional()),
    role: z.nativeEnum(EmployeeRole).optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    branchID: z.coerce.number().optional(),
    clientId: z.coerce.number().optional(),
    locationID: z.coerce.number().optional(),
    deleted: z.preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return false;
    }, z.boolean().default(false)),
    minified: z.preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean().optional()),
  })
  .transform((data) => {
    if (data.size > 500 && data.minified !== true) {
      return {
        ...data,
        size: 10,
      };
    }
    return data;
  });

export type EmployeesFiltersType = z.infer<typeof EmployeesFiltersSchema>;
