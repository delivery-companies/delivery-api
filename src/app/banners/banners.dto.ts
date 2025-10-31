// // import { generateMock } from "@anatine/zod-mock";
import {generateSchema} from "@anatine/zod-openapi";
import {z} from "zod";

export const BannerCreateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  url: z.string().optional(),
});

export type BannerCreateType = z.infer<typeof BannerCreateSchema>;

export const BannerCreateOpenAPISchema = generateSchema(BannerCreateSchema);

// export const BannerCreateMock = generateMock(BannerCreateSchema);

export const BannerUpdateSchema = BannerCreateSchema.partial();

export type BannerUpdateType = z.infer<typeof BannerUpdateSchema>;

export const BannerUpdateOpenAPISchema = generateSchema(BannerUpdateSchema);

// export const BannerUpdateMock = generateMock(BannerUpdateSchema);
