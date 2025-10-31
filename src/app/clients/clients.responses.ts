import type { Prisma } from "@prisma/client";

export const clientSelect = {
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      avatar: true,
    },
  },
  role: true,
  showNumbers: true,
  showDeliveryNumber: true,
  governoratesDeliveryCosts: true,
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
  repository: {
    select: {
      id: true,
      name: true,
    },
  },
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
      logo: true,
      color: true,
    },
  },
  deleted: true,
  deletedAt: true,
  deletedBy: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ClientSelect;

export const clientReform = (
  client: Prisma.ClientGetPayload<{
    select: typeof clientSelect;
  }> | null
) => {
  if (!client) {
    return null;
  }
  return {
    // TODO
    id: client.user.id,
    name: client.user.name,
    username: client.user.username,
    phone: client.user.phone,
    avatar: client.user.avatar,
    role: client.role,
    showNumbers: client.showNumbers,
    showDeliveryNumber: client.showDeliveryNumber,
    company: client.company,
    repository: client.repository,
    branch: client.branch,
    governoratesDeliveryCosts: client.governoratesDeliveryCosts,
    createdBy: client.createdBy,
    deleted: client.deleted,
    deletedBy: client.deleted && client.deletedBy,
    deletedAt: client.deletedAt?.toISOString(),
  };
};
