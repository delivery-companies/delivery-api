import type {Prisma} from "@prisma/client";

export const clientReceiptSelect = {
  id: true,
  receiptNumber: true,
  storeId: true,
  branchId: true,
  notes: true,
  store: {
    select: {
      name: true,
      client: {
        select: {
          id: true,
          showNumbers: true,
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
          company: {
            select: {
              id: true,
              logo: true,
            },
          },
        },
      },
    },
  },
  branch: {
    select: {
      name: true,
      company: {
        select: {
          id: true,
          logo: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.ClientOrderReceiptSelect;

export const receiptReform = (
  receipt: Prisma.ClientOrderReceiptGetPayload<{
    select: typeof clientReceiptSelect;
  }> | null
) => {
  if (!receipt) {
    return null;
  }
  const receiptReformed = {
    ...receipt,
    // TODO
    branch: {
      name: receipt.branch.name,
      companyLogo: receipt.branch?.company.logo,
      companyName: receipt.branch?.company.name,
    },
    client: {
      name: receipt.store?.client.user.name,
      phone: receipt.store?.client.user.phone,
      showNumbers: receipt.store?.client.showNumbers,
      companyLogo: receipt.branch?.company.logo,
      companyId: receipt.store?.client.company.id,
    },
  };
  return receiptReformed;
};
