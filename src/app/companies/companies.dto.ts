// // import { generateMock } from "@anatine/zod-mock";
import { generateSchema } from "@anatine/zod-openapi";
import { z } from "zod";

/*******************************************************************************
 * Empty string needs to be converted to null
 *******************************************************************************/
export const CompanyCreateSchema = z.preprocess(
    (data) => {
        return {
            // @ts-expect-error
            companyData: JSON.parse(data.companyData),
            // @ts-expect-error
            companyManager: JSON.parse(data.companyManager)
        };
    },
    z.object({
        companyData: z.object({
            name: z.string().min(3),
            phone: z.string().min(6),
            // website: z.preprocess((data) => (data === "" ? undefined : data), z.string().url().optional()),
            logo: z.preprocess((_data) => {
                return "";
            }, z.string().optional()),
            color: z.preprocess(
                (data) => (data === "" ? undefined : data),
                z.string().toUpperCase().length(6).optional()
            ),
            registrationText: z.preprocess((data) => (data === "" ? undefined : data), z.string().optional()),
            governoratePrice: z.coerce.number().min(0),
            deliveryAgentFee: z.coerce.number().min(0),
            baghdadPrice: z.coerce.number().min(0),
            additionalPriceForEvery500000IraqiDinar: z.coerce.number().min(0),
            additionalPriceForEveryKilogram: z.coerce.number().min(0),
            additionalPriceForRemoteAreas: z.coerce.number().min(0),
            orderStatusAutomaticUpdate: z.preprocess(
                (data) => (data === "" ? undefined : data),
                z.coerce.boolean().optional()
            )
        }),
        companyManager: z.object({
            username: z.string().min(3),
            name: z.string().min(3),
            password: z.string().min(6),
            phone: z.string().min(6),
            avatar: z.preprocess((_data) => {
                return "";
            }, z.string().optional())
        })
    })
);

export type CompanyCreateType = z.infer<typeof CompanyCreateSchema>;

export const CompanyCreateOpenAPISchema = generateSchema(CompanyCreateSchema);

// export const CompanyCreateMock = generateMock(CompanyCreateSchema);

//---------------------------------------------------------------

export const CompanyUpdateSchema = z
    .object({
        companyManagerID: z.number().optional(),
        name: z.string().min(3),
        phone: z.string().min(6),
        // website: z.preprocess((data) => (data === "" ? undefined : data), z.string().url().optional()),
        logo: z.string().optional(),
        color: z.string().toUpperCase().length(6).optional(),
        registrationText: z.string().optional(),
        governoratePrice: z.coerce.number().min(0),
        deliveryAgentFee: z.coerce.number().min(0),
        baghdadPrice: z.coerce.number().min(0),
        additionalPriceForEvery500000IraqiDinar: z.coerce.number().min(0),
        additionalPriceForEveryKilogram: z.coerce.number().min(0),
        additionalPriceForRemoteAreas: z.coerce.number().min(0),
        orderStatusAutomaticUpdate: z.coerce.boolean().optional(),
        password: z.string().min(6).optional()
    })
    .partial();

export type CompanyUpdateType = z.infer<typeof CompanyUpdateSchema>;

export const CompanyUpdateOpenAPISchema = generateSchema(CompanyUpdateSchema);

// export const CompanyUpdateMock = generateMock(CompanyUpdateSchema);
