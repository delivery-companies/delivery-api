"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const employees_dto_1 = require("../app/employees/employees.dto");
const auth_dto_1 = require("../app/auth/auth.dto");
const repositories_dto_1 = require("../app/repositories/repositories.dto");
const locations_dto_1 = require("../app/locations/locations.dto");
const clients_dto_1 = require("../app/clients/clients.dto");
const branches_dto_1 = require("../app/branches/branches.dto");
const companies_dto_1 = require("../app/companies/companies.dto");
const orders_dto_1 = require("../app/orders/orders.dto");
const products_dto_1 = require("../app/products/products.dto");
const notifications_dto_1 = require("../app/notifications/notifications.dto");
const categories_dto_1 = require("../app/categories/categories.dto");
const colors_dto_1 = require("../app/colors/colors.dto");
const sizes_dto_1 = require("../app/sizes/sizes.dto");
const stores_dto_1 = require("../app/stores/stores.dto");
const banners_dto_1 = require("../app/banners/banners.dto");
const reports_dto_1 = require("../app/reports/reports.dto");
const automaticUpdates_dto_1 = require("./../app/automatic-updates/automaticUpdates.dto");
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
            EmployeeCreateSchema: employees_dto_1.EmployeeCreateOpenAPISchema,
            UserSigninSchema: auth_dto_1.UserSigninOpenAPISchema,
            RepositoryCreateSchema: repositories_dto_1.RepositoryCreateOpenAPISchema,
            EmployeeUpdateSchema: employees_dto_1.EmployeeUpdateOpenAPISchema,
            RepositoryUpdateSchema: repositories_dto_1.RepositoryUpdateOpenAPISchema,
            LocationCreateSchema: locations_dto_1.LocationCreateOpenAPISchema,
            LocationUpdateSchema: locations_dto_1.LocationUpdateOpenAPISchema,
            ClientCreateSchema: clients_dto_1.ClientCreateOpenAPISchema,
            ClientUpdateSchema: clients_dto_1.ClientUpdateOpenAPISchema,
            BranchCreateSchema: branches_dto_1.BranchCreateOpenAPISchema,
            BranchUpdateSchema: branches_dto_1.BranchUpdateOpenAPISchema,
            CompanyCreateSchema: companies_dto_1.CompanyCreateOpenAPISchema,
            CompanyUpdateSchema: companies_dto_1.CompanyUpdateOpenAPISchema,
            OrderCreateSchema: orders_dto_1.OrderCreateOpenAPISchema,
            OrderUpdateSchema: orders_dto_1.OrderUpdateOpenAPISchema,
            ProductCreateSchema: products_dto_1.ProductCreateOpenAPISchema,
            ProductUpdateSchema: products_dto_1.ProductUpdateOpenAPISchema,
            NotificationUpdateSchema: notifications_dto_1.NotificationUpdateOpenAPISchema,
            CategoryUpdateSchema: categories_dto_1.CategoryUpdateOpenAPISchema,
            CategoryCreateSchema: categories_dto_1.CategoryCreateOpenAPISchema,
            ColorCreateSchema: colors_dto_1.ColorCreateOpenAPISchema,
            ColorUpdateSchema: colors_dto_1.ColorUpdateOpenAPISchema,
            SizeCreateSchema: sizes_dto_1.SizeCreateOpenAPISchema,
            SizeUpdateSchema: sizes_dto_1.SizeUpdateOpenAPISchema,
            StoreCreateSchema: stores_dto_1.StoreCreateOpenAPISchema,
            StoreUpdateSchema: stores_dto_1.StoreUpdateOpenAPISchema,
            BannerCreateSchema: banners_dto_1.BannerCreateOpenAPISchema,
            BannerUpdateSchema: banners_dto_1.BannerUpdateOpenAPISchema,
            ReportCreateSchema: reports_dto_1.ReportCreateOpenAPISchema,
            ReportUpdateSchema: reports_dto_1.ReportUpdateOpenAPISchema,
            OrdersReceiptsCreateSchema: orders_dto_1.OrdersReceiptsCreateOpenAPISchema,
            AutomaticUpdateCreateSchema: automaticUpdates_dto_1.AutomaticUpdateCreateOpenAPISchema,
            AutomaticUpdateUpdateSchema: automaticUpdates_dto_1.AutomaticUpdateUpdateOpenAPISchema
        }
    }
};
const outputFile = "./src/swagger/swagger-output.json";
const endpointsFiles = ["./src/app.ts"];
(0, swagger_autogen_1.default)({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
//# sourceMappingURL=swagger.js.map