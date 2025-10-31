import swaggerAutogen from "swagger-autogen";
import { EmployeeCreateOpenAPISchema, EmployeeUpdateOpenAPISchema } from "../app/employees/employees.dto";

import { UserSigninOpenAPISchema } from "../app/auth/auth.dto";

import {
    RepositoryCreateOpenAPISchema,
    RepositoryUpdateOpenAPISchema
} from "../app/repositories/repositories.dto";

import { LocationCreateOpenAPISchema, LocationUpdateOpenAPISchema } from "../app/locations/locations.dto";

import { ClientCreateOpenAPISchema, ClientUpdateOpenAPISchema } from "../app/clients/clients.dto";

import { BranchCreateOpenAPISchema, BranchUpdateOpenAPISchema } from "../app/branches/branches.dto";

import { CompanyCreateOpenAPISchema, CompanyUpdateOpenAPISchema } from "../app/companies/companies.dto";

import {
    OrderCreateOpenAPISchema,
    OrderUpdateOpenAPISchema,
    OrdersReceiptsCreateOpenAPISchema
} from "../app/orders/orders.dto";

import { ProductCreateOpenAPISchema, ProductUpdateOpenAPISchema } from "../app/products/products.dto";

import { NotificationUpdateOpenAPISchema } from "../app/notifications/notifications.dto";

import { CategoryCreateOpenAPISchema, CategoryUpdateOpenAPISchema } from "../app/categories/categories.dto";

import { ColorCreateOpenAPISchema, ColorUpdateOpenAPISchema } from "../app/colors/colors.dto";

import { SizeCreateOpenAPISchema, SizeUpdateOpenAPISchema } from "../app/sizes/sizes.dto";

import { StoreCreateOpenAPISchema, StoreUpdateOpenAPISchema } from "../app/stores/stores.dto";

import { BannerCreateOpenAPISchema, BannerUpdateOpenAPISchema } from "../app/banners/banners.dto";

import { ReportCreateOpenAPISchema, ReportUpdateOpenAPISchema } from "../app/reports/reports.dto";

import {
    AutomaticUpdateCreateOpenAPISchema,
    AutomaticUpdateUpdateOpenAPISchema
} from "./../app/automatic-updates/automaticUpdates.dto";

const doc = {
    info: {
        version: "1.0.0",
        title: "Al Barq API",
        description: ""
    },
    host: "localhost:3000",
    basePath: "/api/",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [],
    securityDefinitions: {
        // bearerAuth: {
        //     type: "http",
        //     scheme: "bearer",
        //     bearerFormat: "JWT"
        // }
    },
    components: {
        examples: {
            // EmployeeCreateExample: { value: EmployeeCreateMock },
            // UserSigninExample: { value: UserSigninMock },
            // RepositoryCreateExample: { value: RepositoryCreateMock },
            // EmployeeUpdateExample: { value: EmployeeUpdateMock },
            // RepositoryUpdateExample: { value: RepositoryUpdateMock },
            // LocationCreateExample: { value: LocationCreateMock },
            // LocationUpdateExample: { value: LocationUpdateMock },
            // ClientCreateExample: { value: ClientCreateMock },
            // ClientUpdateExample: { value: ClientUpdateMock },
            // BranchCreateExample: { value: BranchCreateMock },
            // BranchUpdateExample: { value: BranchUpdateMock },
            // CompanyCreateExample: { value: CompanyCreateMock },
            // CompanyUpdateExample: { value: CompanyUpdateMock },
            // OrderCreateExample: { value: OrderCreateMock },
            // OrderUpdateExample: { value: OrderUpdateMock },
            // ProductCreateExample: { value: ProductCreateMock },
            // ProductUpdateExample: { value: ProductUpdateMock },
            // NotificationUpdateExample: { value: NotificationUpdateMock },
            // CategoryUpdateExample: { value: CategoryUpdateMock },
            // CategoryCreateExample: { value: CategoryCreateMock },
            // ColorCreateExample: { value: ColorCreateMock },
            // ColorUpdateExample: { value: ColorUpdateMock },
            // SizeCreateExample: { value: SizeCreateMock },
            // SizeUpdateExample: { value: SizeUpdateMock },
            // StoreCreateExample: { value: StoreCreateMock },
            // StoreUpdateExample: { value: StoreUpdateMock },
            // BannerCreateExample: { value: BannerCreateMock },
            // BannerUpdateExample: { value: BannerUpdateMock },
            // ReportCreateExample: { value: ReportCreateMock },
            // ReportUpdateExample: { value: ReportUpdateMock },
            // OrdersReceiptsCreateExample: { value: OrdersReceiptsCreateMock },
            // AutomaticUpdateCreateExample: {
            //     value: AutomaticUpdateCreateMock
            // },
            // AutomaticUpdateUpdateExample: {
            //     value: AutomaticUpdateUpdateMock
            // }
        },
        "@schemas": {
            SuccessResponseSchema: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["success"]
                    },
                    data: {
                        type: "object"
                    }
                }
            },
            // SigninSuccessResponseSchema: {
            //     type: "object",
            //     properties: {
            //         status: {
            //             type: "string",
            //             enum: ["success"]
            //         },
            //         data: {
            //             type: "object",
            //             properties: {
            //                 token: {
            //                     type: "string"
            //                 }
            //             }
            //         }
            //     }
            // },
            ErrorResponseSchema: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["error"]
                    },
                    message: {
                        type: "string"
                    }
                }
            },
            EmployeeCreateSchema: EmployeeCreateOpenAPISchema,
            UserSigninSchema: UserSigninOpenAPISchema,
            RepositoryCreateSchema: RepositoryCreateOpenAPISchema,
            EmployeeUpdateSchema: EmployeeUpdateOpenAPISchema,
            RepositoryUpdateSchema: RepositoryUpdateOpenAPISchema,
            LocationCreateSchema: LocationCreateOpenAPISchema,
            LocationUpdateSchema: LocationUpdateOpenAPISchema,
            ClientCreateSchema: ClientCreateOpenAPISchema,
            ClientUpdateSchema: ClientUpdateOpenAPISchema,
            BranchCreateSchema: BranchCreateOpenAPISchema,
            BranchUpdateSchema: BranchUpdateOpenAPISchema,
            CompanyCreateSchema: CompanyCreateOpenAPISchema,
            CompanyUpdateSchema: CompanyUpdateOpenAPISchema,
            OrderCreateSchema: OrderCreateOpenAPISchema,
            OrderUpdateSchema: OrderUpdateOpenAPISchema,
            ProductCreateSchema: ProductCreateOpenAPISchema,
            ProductUpdateSchema: ProductUpdateOpenAPISchema,
            NotificationUpdateSchema: NotificationUpdateOpenAPISchema,
            CategoryUpdateSchema: CategoryUpdateOpenAPISchema,
            CategoryCreateSchema: CategoryCreateOpenAPISchema,
            ColorCreateSchema: ColorCreateOpenAPISchema,
            ColorUpdateSchema: ColorUpdateOpenAPISchema,
            SizeCreateSchema: SizeCreateOpenAPISchema,
            SizeUpdateSchema: SizeUpdateOpenAPISchema,
            StoreCreateSchema: StoreCreateOpenAPISchema,
            StoreUpdateSchema: StoreUpdateOpenAPISchema,
            BannerCreateSchema: BannerCreateOpenAPISchema,
            BannerUpdateSchema: BannerUpdateOpenAPISchema,
            ReportCreateSchema: ReportCreateOpenAPISchema,
            ReportUpdateSchema: ReportUpdateOpenAPISchema,
            OrdersReceiptsCreateSchema: OrdersReceiptsCreateOpenAPISchema,
            AutomaticUpdateCreateSchema: AutomaticUpdateCreateOpenAPISchema,
            AutomaticUpdateUpdateSchema: AutomaticUpdateUpdateOpenAPISchema
        }
    }
};

const outputFile = "./src/swagger/swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
