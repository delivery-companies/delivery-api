"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesRepository = void 0;
const db_1 = require("../../database/db");
const companies_responses_1 = require("./companies.responses");
class CompaniesRepository {
    async createCompany(data) {
        const createdCompany = await db_1.prisma.company.create({
            data: {
                name: data.companyData.companyData.name,
                phone: data.companyData.companyData.phone,
                // website: data.companyData.companyData.website,
                logo: data.companyData.companyData.logo,
                color: data.companyData.companyData.color,
                registrationText: data.companyData.companyData.registrationText,
                governoratePrice: data.companyData.companyData.governoratePrice,
                deliveryAgentFee: data.companyData.companyData.deliveryAgentFee,
                baghdadPrice: data.companyData.companyData.baghdadPrice,
                additionalPriceForEvery500000IraqiDinar: data.companyData.companyData.additionalPriceForEvery500000IraqiDinar,
                additionalPriceForEveryKilogram: data.companyData.companyData.additionalPriceForEveryKilogram,
                additionalPriceForRemoteAreas: data.companyData.companyData.additionalPriceForRemoteAreas,
                orderStatusAutomaticUpdate: data.companyData.companyData.orderStatusAutomaticUpdate,
                employees: {
                    create: {
                        user: {
                            create: {
                                username: data.companyData.companyManager.username,
                                name: data.companyData.companyManager.name,
                                password: data.companyData.companyManager.password,
                                phone: data.companyData.companyManager.phone
                            }
                        },
                        createdBy: {
                            connect: {
                                id: data.loggedInUser.id
                            }
                        },
                        role: "COMPANY_MANAGER"
                    }
                }
            },
            select: companies_responses_1.companySelect
        });
        return createdCompany;
    }
    async getAllCompaniesPaginated(filters) {
        if (filters.minified === true) {
            const paginatedCompanies = await db_1.prisma.company.findManyPaginated({
                select: {
                    id: true,
                    name: true
                },
                where: {
                    mainCompany: filters.mainCompany
                },
                orderBy: [
                    {
                        mainCompany: "desc"
                    },
                    {
                        name: "asc"
                    }
                ]
            }, {
                page: filters.page,
                size: filters.size
            });
            return { companies: paginatedCompanies.data, pagesCount: paginatedCompanies.pagesCount };
        }
        const paginatedCompanies = await db_1.prisma.company.findManyPaginated({
            orderBy: [
                {
                    mainCompany: "desc"
                },
                {
                    name: "asc"
                }
            ],
            select: companies_responses_1.companySelect,
            where: {
                mainCompany: filters.mainCompany
            }
        }, {
            page: filters.page,
            size: filters.size
        });
        return { companies: paginatedCompanies.data, pagesCount: paginatedCompanies.pagesCount };
    }
    async getCompany(data) {
        const company = await db_1.prisma.company.findUnique({
            where: {
                id: data.companyID
            },
            select: companies_responses_1.companySelect
        });
        return company;
    }
    async updateCompany(data) {
        const company = await db_1.prisma.company.update({
            where: {
                id: data.companyID
            },
            data: {
                name: data.companyData.name,
                phone: data.companyData.phone,
                // website: data.companyData.website,
                logo: data.companyData.logo,
                color: data.companyData.color,
                registrationText: data.companyData.registrationText,
                governoratePrice: data.companyData.governoratePrice,
                deliveryAgentFee: data.companyData.deliveryAgentFee,
                baghdadPrice: data.companyData.baghdadPrice,
                additionalPriceForEvery500000IraqiDinar: data.companyData.additionalPriceForEvery500000IraqiDinar,
                additionalPriceForEveryKilogram: data.companyData.additionalPriceForEveryKilogram,
                additionalPriceForRemoteAreas: data.companyData.additionalPriceForRemoteAreas,
                orderStatusAutomaticUpdate: data.companyData.orderStatusAutomaticUpdate,
                employees: {
                    update: {
                        where: {
                            id: data.companyData.companyManagerID
                        },
                        data: {
                            user: {
                                update: {
                                    username: data.companyData.phone,
                                    phone: data.companyData.phone,
                                    password: data.companyData.password,
                                    avatar: data.companyData.logo
                                }
                            }
                        }
                    }
                }
            },
            select: companies_responses_1.companySelect
        });
        return company;
    }
    // add or substract money from company treasury
    async updateCompanyTreasury(data) {
        await db_1.prisma.company.update({
            where: {
                id: data.companyID
            },
            data: {
                treasury: data.treasury.type === "increment"
                    ? {
                        increment: data.treasury.amount
                    }
                    : {
                        decrement: data.treasury.amount
                    }
            }
        });
    }
    async deleteCompany(data) {
        await db_1.prisma.company.delete({
            where: {
                id: data.companyID
            },
            select: companies_responses_1.companySelect
        });
        return true;
    }
}
exports.CompaniesRepository = CompaniesRepository;
//# sourceMappingURL=companies.repository.js.map