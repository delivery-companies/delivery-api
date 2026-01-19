"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationReform = exports.locationSelect = void 0;
exports.locationSelect = {
    id: true,
    name: true,
    governorate: true,
    branch: true,
    remote: true,
    deliveryAgentsLocations: {
        select: {
            deliveryAgent: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
    },
    company: {
        select: {
            id: true,
            name: true,
        },
    },
};
const locationReform = (location) => {
    if (!location) {
        return null;
    }
    return {
        id: location.id,
        name: location.name,
        governorate: location.governorate,
        branch: location.branch,
        deliveryAgents: location.deliveryAgentsLocations.map((deliveryAgent) => {
            return {
                id: deliveryAgent.deliveryAgent.user.id,
                name: deliveryAgent.deliveryAgent.user.name,
                phone: deliveryAgent.deliveryAgent.user.phone,
            };
        }),
        company: location.company,
        remote: location.remote,
    };
};
exports.locationReform = locationReform;
//# sourceMappingURL=locations.responses.js.map