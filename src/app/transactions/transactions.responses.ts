import {Prisma} from "@prisma/client";

export const transactionSelect = {
  id: true,
  type: true,
  for: true,
  paidAmount: true,
  employee: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TransactionSelect;
