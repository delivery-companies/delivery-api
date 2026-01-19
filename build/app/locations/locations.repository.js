"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsRepository = exports.governorateArabicNames = void 0;
const db_1 = require("../../database/db");
const locations_responses_1 = require("./locations.responses");
exports.governorateArabicNames = {
    AL_ANBAR: "الأنبار",
    BABIL: "بابل",
    BAGHDAD: "بغداد",
    BASRA: "البصرة",
    DHI_QAR: "ذي قار",
    AL_QADISIYYAH: "القادسية",
    DIYALA: "ديالى",
    DUHOK: "دهوك",
    ERBIL: "أربيل",
    KARBALA: "كربلاء",
    KIRKUK: "كركوك",
    MAYSAN: "ميسان",
    MUTHANNA: "المثنى",
    NAJAF: "النجف",
    NINAWA: "نينوى",
    SALAH_AL_DIN: "صلاح الدين",
    SULAYMANIYAH: "السليمانية",
    WASIT: "واسط",
    BABIL_COMPANIES: "شركات بابل",
};
class LocationsRepository {
    async createLocation(loggedInUser, data) {
        const companyID = loggedInUser.companyID;
        const createdLocation = await db_1.prisma.location.create({
            data: {
                name: data.name,
                governorate: data.governorate,
                governorateAr: exports.governorateArabicNames[data.governorate],
                remote: data.remote,
                branch: {
                    connect: {
                        id: data.branchID,
                    },
                },
                deliveryAgentsLocations: data.deliveryAgentsIDs
                    ? {
                        create: data.deliveryAgentsIDs?.map((id) => {
                            return {
                                deliveryAgent: {
                                    connect: {
                                        id: id,
                                    },
                                },
                                company: {
                                    connect: {
                                        id: loggedInUser.companyID,
                                    },
                                },
                            };
                        }),
                    }
                    : undefined,
                company: companyID
                    ? {
                        connect: {
                            id: companyID,
                        },
                    }
                    : undefined,
            },
            select: locations_responses_1.locationSelect,
        });
        return (0, locations_responses_1.locationReform)(createdLocation);
    }
    async getAllLocationsPaginated(filters) {
        const where = {
            AND: [
                {
                    name: {
                        contains: filters.search,
                    },
                },
                {
                    branch: filters.minified === true
                        ? undefined
                        : {
                            id: filters.branchID,
                        },
                },
                {
                    governorate: filters.governorate,
                },
                {
                    deliveryAgentsLocations: filters.deliveryAgentID
                        ? {
                            some: {
                                deliveryAgent: {
                                    id: filters.deliveryAgentID,
                                },
                            },
                        }
                        : undefined,
                },
                {
                    company: {
                        id: filters.companyID,
                    },
                },
            ],
        };
        if (filters.minified === true) {
            const paginatedLocations = await db_1.prisma.location.findManyPaginated({
                where: where,
                select: {
                    id: true,
                    name: true,
                    governorate: true,
                    branchId: true,
                },
            }, {
                page: 1,
                size: 10000,
            });
            return {
                locations: paginatedLocations.data,
                pagesCount: paginatedLocations.pagesCount,
            };
        }
        const paginatedLocations = await db_1.prisma.location.findManyPaginated({
            where: where,
            orderBy: {
                id: "desc",
            },
            select: {
                ...locations_responses_1.locationSelect,
                // This makes sure that only delivery agents that belong to the loggedin user company are returned
                deliveryAgentsLocations: {
                    select: locations_responses_1.locationSelect.deliveryAgentsLocations.select,
                    where: {
                        company: {
                            id: filters.companyID,
                        },
                    },
                },
            },
        }, {
            page: filters.page,
            size: filters.size,
        });
        return {
            locations: paginatedLocations.data.map(locations_responses_1.locationReform),
            pagesCount: paginatedLocations.pagesCount,
        };
    }
    async getLocation(data) {
        const location = await db_1.prisma.location.findUnique({
            where: {
                id: data.locationID,
            },
            select: locations_responses_1.locationSelect,
        });
        return (0, locations_responses_1.locationReform)(location);
    }
    async updateLocation(data) {
        const location = await db_1.prisma.location.update({
            where: {
                id: data.locationID,
            },
            data: {
                name: data.locationData.name,
                governorate: data.locationData.governorate,
                governorateAr: data.locationData.governorate
                    ? exports.governorateArabicNames[data.locationData.governorate]
                    : undefined,
                remote: data.locationData.remote,
                branch: data.locationData.branchID
                    ? {
                        connect: {
                            id: data.locationData.branchID,
                        },
                    }
                    : undefined,
                deliveryAgentsLocations: data.locationData.deliveryAgentsIDs
                    ? {
                        deleteMany: {
                            locationId: data.locationID,
                            companyId: data.loggedInUser.companyID,
                        },
                        create: data.locationData.deliveryAgentsIDs?.map((id) => {
                            return {
                                deliveryAgent: {
                                    connect: {
                                        id: id,
                                    },
                                },
                                company: {
                                    connect: {
                                        id: data.loggedInUser.companyID,
                                    },
                                },
                            };
                        }),
                    }
                    : undefined,
            },
            select: locations_responses_1.locationSelect,
        });
        return (0, locations_responses_1.locationReform)(location);
    }
    async deleteLocation(data) {
        await db_1.prisma.location.delete({
            where: {
                id: data.locationID,
            },
        });
        return true;
    }
    async publicGetAllLocations(governorate) {
        const locations = await db_1.prisma.location.findMany({
            where: {
                governorate: governorate || undefined,
            },
            select: {
                id: true,
                name: true,
            },
        });
        return locations;
    }
}
exports.LocationsRepository = LocationsRepository;
//# sourceMappingURL=locations.repository.js.map