import type { Prisma } from "@prisma/client";

export const locationSelect = {
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
} satisfies Prisma.LocationSelect;

export const locationReform = (
  location: Prisma.LocationGetPayload<{
    select: typeof locationSelect;
  }> | null
) => {
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
