import type { Prisma } from "@prisma/client";

export const companySelect = {
    id: true,
    name: true,
    phone: true,
    website: true,
    logo: true,
    color: true,
    registrationText: true,
    governoratePrice: true,
    deliveryAgentFee: true,
    baghdadPrice: true,
    additionalPriceForEvery500000IraqiDinar: true,
    additionalPriceForEveryKilogram: true,
    additionalPriceForRemoteAreas: true,
    orderStatusAutomaticUpdate: true,
    treasury: true
} satisfies Prisma.CompanySelect;

// const companyReform = (company: any) => {
//     return {
//         id: company.id,
//         name: company.name,
//         phone: company.phone,
//         website: company.website,
//         logo: company.logo,
//         registrationText: company.registrationText,
//         governoratePrice: company.governoratePrice,
//         deliveryAgentFee: company.deliveryAgentFee,
//         baghdadPrice: company.baghdadPrice,
//         additionalPriceForEvery500000IraqiDinar:
//             company.additionalPriceForEvery500000IraqiDinar,
//         additionalPriceForEveryKilogram: company.additionalPriceForEveryKilogram,
//         additionalPriceForRemoteAreas: company.additionalPriceForRemoteAreas,
//         orderStatusAutomaticUpdate: company.orderStatusAutomaticUpdate
//     };
// };
