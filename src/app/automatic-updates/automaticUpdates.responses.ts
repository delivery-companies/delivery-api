import type {Prisma} from "@prisma/client";

export const automaticUpdateSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
    },
  },
  orderStatus: true,
  returnCondition: true,
  updateAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  newOrderStatus: true,
  checkAfter: true,
  notes: true,
  enabled: true,
} satisfies Prisma.AutomaticUpdateSelect;

// export const automaticUpdateReform = (automaticUpdate: any) => {
//     return {
//         id: automaticUpdate.id,
//         title: automaticUpdate.title,
//         createdAt: automaticUpdate.createdAt,
//         updatedAt: automaticUpdate.updatedAt
//     };
// };

/* --------------------------------------------------------------- */
