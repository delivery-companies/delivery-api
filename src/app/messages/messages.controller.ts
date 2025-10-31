import {Governorate, OrderStatus} from "@prisma/client";
import {prisma} from "../../database/db";
import {catchAsync} from "../../lib/catchAsync";
import {loggedInUserType} from "../../types/user";
import {sendNotification} from "../notifications/helpers/sendNotification";
import {EmployeesRepository} from "../employees/employees.repository";
import _ from "lodash";
import {io} from "../../server";
import {AppError} from "../../lib/AppError";

const employeesRepository = new EmployeesRepository();

export class MessagesController {
  getOrderChatMembers = async (orderId: string) => {
    let chatMembers: number[] = [];

    if (!orderId) {
      return chatMembers;
    }
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        status: true,
        storeId: true,
        locationId: true,
        governorate: true,
        clientId: true,
        deliveryAgentId: true,
        branchId: true,
        companyId: true,
      },
    });
    const companyManagers = await prisma.employee.findMany({
      where: {
        role: "COMPANY_MANAGER",
        companyId: order?.companyId,
      },
      select: {
        id: true,
      },
    });
    const branchManagers = await prisma.employee.findMany({
      where: {
        role: "BRANCH_MANAGER",
        branchId: order?.branchId,
      },
      select: {
        id: true,
      },
    });

    const inquiryEmployees = await prisma.employee.findMany({
      where: {
        AND: [
          {role: "INQUIRY_EMPLOYEE"},
          {
            inquiryStatuses: order?.status ? {has: order.status} : undefined,
          },
          {
            inquiryBranches: order?.branchId
              ? {
                  some: {
                    branchId: order.branchId,
                  },
                }
              : undefined,
          },
          {
            inquiryCompanies: order?.companyId
              ? {
                  some: {
                    companyId: order.companyId,
                  },
                }
              : undefined,
          },
          {
            inquiryStores: order?.storeId
              ? {
                  some: {
                    storeId: order.storeId,
                  },
                }
              : undefined,
          },
          {
            inquiryLocations: order?.locationId
              ? {
                  some: {
                    locationId: order.locationId,
                  },
                }
              : undefined,
          },
          // TODO
          {
            inquiryGovernorates: order?.governorate
              ? {has: order.governorate}
              : undefined,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    const clientAssistant = await prisma.employee.findMany({
      where: {
        AND: [
          {role: "CLIENT_ASSISTANT"},
          {clientId: order?.clientId},
          {
            managedStores: {
              some: {
                id: order?.storeId,
              },
            },
          },
          {
            orderStatus: {has: order?.status},
          },
          {
            permissions: {has: "MESSAGES"},
          },
        ],
      },
      select: {
        id: true,
      },
    });
    inquiryEmployees.forEach((e) => {
      chatMembers.push(e.id);
    });
    companyManagers.forEach((e) => {
      chatMembers.push(e.id);
    });
    branchManagers.forEach((e) => {
      chatMembers.push(e.id);
    });
    clientAssistant.forEach((e) => {
      chatMembers.push(e.id);
    });
    order?.clientId && chatMembers.push(order?.clientId);
    order?.deliveryAgentId && chatMembers.push(order?.deliveryAgentId);

    return chatMembers;
  };

  getUserChats = async (
    user: loggedInUserType,
    size: number,
    page: number,
    status: string | undefined,
    unRead?: string
  ) => {
    const employee = await prisma.employee.findUnique({
      where: {
        id: +user.id,
      },
      select: {
        id: true,
        role: true,
        branchId: true,
        managedStores: true,
        inquiryBranches: true,
        inquiryGovernorates: true,
        inquiryStatuses: true,
        inquiryLocations: true,
        inquiryStores: true,
        permissions: true,
        orderStatus: true,
      },
    });

    let inquiryStatuses: OrderStatus[] | undefined = undefined;
    let inquiryGovernorates: Governorate[] | undefined = undefined;
    let inquiryLocationsIDs: number[] | undefined = undefined;
    let inquiryBranchesIDs: number[] | undefined = undefined;
    let inquiryStoresIDs: number[] | undefined = undefined;

    if (user.role === "INQUIRY_EMPLOYEE") {
      const inquiryEmployeeStuff =
        await employeesRepository.getInquiryEmployeeStuff({
          employeeID: +user.id,
        });
      if (inquiryEmployeeStuff) {
        inquiryStatuses =
          inquiryEmployeeStuff.inquiryStatuses &&
          inquiryEmployeeStuff.inquiryStatuses.length > 0
            ? inquiryEmployeeStuff.inquiryStatuses
            : undefined;
        inquiryGovernorates =
          inquiryEmployeeStuff.inquiryGovernorates &&
          inquiryEmployeeStuff.inquiryGovernorates.length > 0
            ? inquiryEmployeeStuff.inquiryGovernorates
            : undefined;
        inquiryLocationsIDs =
          inquiryEmployeeStuff.inquiryLocations &&
          inquiryEmployeeStuff.inquiryLocations.length > 0
            ? inquiryEmployeeStuff.inquiryLocations
            : undefined;
        inquiryBranchesIDs =
          inquiryEmployeeStuff.inquiryBranches &&
          inquiryEmployeeStuff.inquiryBranches.length > 0
            ? inquiryEmployeeStuff.inquiryBranches
            : undefined;
        inquiryStoresIDs =
          inquiryEmployeeStuff.inquiryStores &&
          inquiryEmployeeStuff.inquiryStores.length > 0
            ? inquiryEmployeeStuff.inquiryStores
            : undefined;
      }
    }

    if (
      user.role === "CLIENT_ASSISTANT" &&
      !employee?.permissions.includes("MESSAGES")
    ) {
      return {
        totalUnSeened: 0,
        pageCounts: 0,
        count: 0,
        page: 1,
        chats: [],
      };
    }
    if (
      user.role === "EMPLOYEE_CLIENT_ASSISTANT" &&
      !employee?.permissions.includes("MESSAGES")
    ) {
      return {
        totalUnSeened: 0,
        pageCounts: 0,
        count: 0,
        page: 1,
        chats: [],
      };
    }
    if (user.role === "CLIENT_ASSISTANT") {
      inquiryStoresIDs = employee?.managedStores.map((s) => s.id);
    }
    if (user.role === "EMPLOYEE_CLIENT_ASSISTANT") {
      inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
    }
    const chats = await prisma.chat.findManyPaginated(
      {
        where: {
          messages:
            unRead === "true"
              ? {
                  some: {
                    seenByClient: user.role === "CLIENT" ? false : undefined,
                    seenByClientAssistant:
                      user.role === "CLIENT_ASSISTANT" ||
                      user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                        ? false
                        : undefined,
                    seenByDelivery:
                      user.role === "DELIVERY_AGENT" ? false : undefined,
                    seenByBranchManager:
                      user.role === "BRANCH_MANAGER" ? false : undefined,
                    seenByCompanyManager:
                      user.role === "COMPANY_MANAGER" ? false : undefined,
                    seenByCallCenter:
                      user.role === "INQUIRY_EMPLOYEE" ? false : undefined,
                  },
                }
              : {
                  some: {}, // Only include chats that have at least one message
                },
          Order:
            user.role === "INQUIRY_EMPLOYEE"
              ? {
                  AND: [
                    {
                      status:
                        status && status !== "null"
                          ? (status as OrderStatus)
                          : inquiryStatuses
                          ? {
                              in: inquiryStatuses,
                            }
                          : undefined,
                    },
                    {
                      governorate: inquiryGovernorates
                        ? {
                            in: inquiryGovernorates,
                          }
                        : undefined,
                    },
                    {
                      branch: inquiryBranchesIDs
                        ? {
                            id: {
                              in: inquiryBranchesIDs,
                            },
                          }
                        : {
                            id: employee?.branchId!!,
                          },
                    },
                    {
                      store: inquiryStoresIDs
                        ? {
                            id: {
                              in: inquiryStoresIDs,
                            },
                          }
                        : undefined,
                    },
                    {
                      company: {
                        id: user.companyID,
                      },
                    },
                    {
                      location: inquiryLocationsIDs
                        ? {
                            id: {
                              in: inquiryLocationsIDs,
                            },
                          }
                        : undefined,
                    },
                  ],
                }
              : {
                  status:
                    status && status !== "null"
                      ? (status as OrderStatus)
                      : user.role === "CLIENT_ASSISTANT" ||
                        user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                      ? {in: employee?.orderStatus}
                      : undefined,
                  clientId: user.role === "CLIENT" ? user.id : undefined,
                  companyId: user?.companyID || undefined,
                  branchId:
                    user.role !== "COMPANY_MANAGER" &&
                    user.role !== "CLIENT_ASSISTANT" &&
                    !user.mainRepository &&
                    user.role !== "DELIVERY_AGENT"
                      ? employee?.branchId
                      : undefined,
                  deliveryAgentId:
                    user.role === "DELIVERY_AGENT" ? user.id : undefined,
                  storeId:
                    user.role === "CLIENT_ASSISTANT" ||
                    user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                      ? {in: inquiryStoresIDs}
                      : undefined,
                },
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          orderId: true,
          Order: {
            where: {
              deleted: false,
            },
            select: {
              receiptNumber: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc", // Order messages descending
            },
            take: 1,
            select: {
              image: true,
              content: true,
              createdAt: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      {
        page,
        size,
      }
    );

    const unSeenChats = await prisma.message.groupBy({
      by: ["chatId"],
      _count: {
        id: true,
      },
      where: {
        seenByClient: user.role === "CLIENT" ? false : undefined,
        seenByClientAssistant:
          user.role === "CLIENT_ASSISTANT" ||
          user.role === "EMPLOYEE_CLIENT_ASSISTANT"
            ? false
            : undefined,
        seenByDelivery: user.role === "DELIVERY_AGENT" ? false : undefined,
        seenByBranchManager: user.role === "BRANCH_MANAGER" ? false : undefined,
        seenByCompanyManager:
          user.role === "COMPANY_MANAGER" ? false : undefined,
        seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? false : undefined,
        Chat: {
          Order:
            user.role === "INQUIRY_EMPLOYEE"
              ? {
                  AND: [
                    {
                      status: inquiryStatuses
                        ? {
                            in: inquiryStatuses,
                          }
                        : undefined,
                    },
                    {
                      governorate: inquiryGovernorates
                        ? {
                            in: inquiryGovernorates,
                          }
                        : undefined,
                    },
                    {
                      branch: inquiryBranchesIDs
                        ? {
                            id: {
                              in: inquiryBranchesIDs,
                            },
                          }
                        : !user.mainRepository
                        ? {
                            id: user.branchId,
                          }
                        : undefined,
                    },
                    {
                      store: inquiryStoresIDs
                        ? {
                            id: {
                              in: inquiryStoresIDs,
                            },
                          }
                        : undefined,
                    },
                    {
                      company: {
                        id: user.companyID,
                      },
                    },
                    {
                      location: inquiryLocationsIDs
                        ? {
                            id: {
                              in: inquiryLocationsIDs,
                            },
                          }
                        : undefined,
                    },
                  ],
                }
              : {
                  clientId: user.role === "CLIENT" ? user.id : undefined,
                  companyId: user?.companyID || undefined,
                  branchId:
                    user.role !== "COMPANY_MANAGER" &&
                    user.role !== "CLIENT_ASSISTANT" &&
                    user.role !== "EMPLOYEE_CLIENT_ASSISTANT" &&
                    user.role !== "DELIVERY_AGENT"
                      ? employee?.branchId
                      : undefined,
                  deliveryAgentId:
                    user.role === "DELIVERY_AGENT" ? user.id : undefined,
                  storeId:
                    user.role === "CLIENT_ASSISTANT" ||
                    user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                      ? {in: inquiryStoresIDs}
                      : undefined,
                },
        },
      },
    });

    let totalUnSeened = 0;

    unSeenChats.forEach((c) => {
      totalUnSeened += c._count.id;
    });

    const allStatistics = chats.data.map((e) => {
      return {
        id: e.id,
        unseenMessages:
          unSeenChats.find((c) => c.chatId === e.id)?._count.id || 0,
        orderId: e.orderId,
        receiptNumber: e.Order?.receiptNumber,
        lastMessage: e.messages[0],
      };
    });
    return {
      totalUnSeened,
      pageCounts: chats.pagesCount,
      count: chats.dataCount,
      page: chats.currentPage,
      chats: allStatistics,
    };
  };

  getChatMessages = async (orderId: string, userId: number) => {
    const employee = await prisma.employee.findUnique({
      where: {
        id: +userId,
      },
      select: {
        role: true,
        permissions: true,
      },
    });

    if (employee?.role === "CLIENT_ASSISTANT") {
      if (!employee?.permissions.includes("MESSAGES")) {
        return [];
      }
    }

    if (employee?.role === "EMPLOYEE_CLIENT_ASSISTANT") {
      if (!employee?.permissions.includes("MESSAGES")) {
        return [];
      }
    }

    await prisma.message.updateMany({
      where: {
        Chat: {
          orderId: orderId,
        },
      },
      data: {
        seenByClient: employee ? undefined : true,
        seenByDelivery: employee?.role === "DELIVERY_AGENT" ? true : undefined,
        seenByClientAssistant:
          employee?.role === "CLIENT_ASSISTANT" ||
          employee?.role === "EMPLOYEE_CLIENT_ASSISTANT"
            ? true
            : undefined,
        seenByBranchManager:
          employee?.role === "BRANCH_MANAGER" ? true : undefined,
        seenByCompanyManager:
          employee?.role === "COMPANY_MANAGER" ? true : undefined,
        seenByCallCenter:
          employee?.role === "INQUIRY_EMPLOYEE" ? true : undefined,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        Chat: {
          orderId: orderId,
        },
      },
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: messages,
    };
  };

  sendMessage = catchAsync(async (req, res) => {
    const {content, orderId} = req.body;
    const loggedInUser = res.locals.user as loggedInUserType;

    let image: string | undefined;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        receiptNumber: true,
      },
    });

    if (
      loggedInUser.role === "CLIENT_ASSISTANT" ||
      loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT"
    ) {
      const clientAssistant = await prisma.employee.findUnique({
        where: {
          id: loggedInUser.id,
        },
        select: {
          permissions: true,
        },
      });
      if (!clientAssistant?.permissions.includes("MESSAGES")) {
        throw new AppError("ليس لديك صلاحيه", 400);
      }
    }

    if (req.file) {
      const file = req.file as Express.MulterS3.File;
      image = file.location;
    }

    let chat = await prisma.chat.findFirst({
      where: {
        orderId: orderId,
      },
      select: {
        id: true,
        orderId: true,
        numberOfMessages: true,
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          orderId: orderId,
          numberOfMessages: 0,
        },
        select: {
          id: true,
          orderId: true,
          numberOfMessages: true,
        },
      });
    }

    await prisma.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        numberOfMessages: chat.numberOfMessages + 1,
      },
    });

    const message = await prisma.message.create({
      data: {
        content: content ? content : "",
        image: image,
        Chat: {
          connect: {
            id: chat.id,
          },
        },
        createdBy: {
          connect: {
            id: loggedInUser.id,
          },
        },
        seenByClient: loggedInUser.role === "CLIENT",
        seenByClientAssistant:
          loggedInUser.role === "CLIENT_ASSISTANT" ||
          loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT",
        seenByDelivery: loggedInUser.role === "DELIVERY_AGENT",
        seenByBranchManager: loggedInUser.role === "BRANCH_MANAGER",
        seenByCompanyManager: loggedInUser.role === "COMPANY_MANAGER",
        seenByCallCenter: loggedInUser.role === "INQUIRY_EMPLOYEE",
      },
      select: {
        id: true,
        content: true,
        image: true,
        seenByBranchManager: true,
        seenByCompanyManager: true,
        seenByClient: true,
        seenByDelivery: true,
        seenByCallCenter: true,
        seenByClientAssistant: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let chatMembers = await this.getOrderChatMembers(orderId);
    chatMembers = chatMembers.filter((e) => +e !== +loggedInUser.id);

    io.to(`chat_${chat.orderId}`).emit("newChatMessage", message);

    chatMembers.forEach((member) => {
      io.to(`${member}`).emit("newMessage", message);
    });
    // const chats=await this.getUserChats(loggedInUser.id)

    chatMembers.forEach(async (e) => {
      await sendNotification({
        title: `رساله جديده "${content}"`,
        content: `هناك رساله جديده للطلب رقم ${orderId}`,
        userID: e,
        orderId: order?.id,
        chatId: chat.id,
        receiptNumber: order?.receiptNumber,
        forChat: true,
      });
    });

    res.status(201).json({message: "success"});
  });

  getUserChatStatics = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const {size, page, status, unRead} = req.query;
    const chats = await this.getUserChats(
      loggedInUser,
      size ? +size : 20,
      page ? +page : 1,
      typeof status === "string" ? status : undefined,
      unRead + ""
    );

    res.status(201).json({...chats});
  });

  getUserChatMessages = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const {size, page, orderId} = req.query;

    if (!orderId) {
      return;
    }
    const chats = await this.getChatMessages(
      orderId?.toString(),
      loggedInUser.id
    );

    res.status(201).json({...chats});
  });

  markAllSeen = catchAsync(async (req, res) => {
    const user = res.locals.user as loggedInUserType;

    const employee = await prisma.employee.findUnique({
      where: {
        id: +user.id,
      },
      select: {
        id: true,
        role: true,
        branchId: true,
        managedStores: true,
        inquiryBranches: true,
        inquiryGovernorates: true,
        inquiryStatuses: true,
        inquiryLocations: true,
        inquiryStores: true,
        permissions: true,
        orderStatus: true,
      },
    });

    let inquiryStatuses: OrderStatus[] | undefined = undefined;
    let inquiryGovernorates: Governorate[] | undefined = undefined;
    let inquiryLocationsIDs: number[] | undefined = undefined;
    let inquiryBranchesIDs: number[] | undefined = undefined;
    let inquiryStoresIDs: number[] | undefined = undefined;

    if (user.role === "INQUIRY_EMPLOYEE") {
      const inquiryEmployeeStuff =
        await employeesRepository.getInquiryEmployeeStuff({
          employeeID: +user.id,
        });
      if (inquiryEmployeeStuff) {
        inquiryStatuses =
          inquiryEmployeeStuff.inquiryStatuses &&
          inquiryEmployeeStuff.inquiryStatuses.length > 0
            ? inquiryEmployeeStuff.inquiryStatuses
            : undefined;
        inquiryGovernorates =
          inquiryEmployeeStuff.inquiryGovernorates &&
          inquiryEmployeeStuff.inquiryGovernorates.length > 0
            ? inquiryEmployeeStuff.inquiryGovernorates
            : undefined;
        inquiryLocationsIDs =
          inquiryEmployeeStuff.inquiryLocations &&
          inquiryEmployeeStuff.inquiryLocations.length > 0
            ? inquiryEmployeeStuff.inquiryLocations
            : undefined;
        inquiryBranchesIDs =
          inquiryEmployeeStuff.inquiryBranches &&
          inquiryEmployeeStuff.inquiryBranches.length > 0
            ? inquiryEmployeeStuff.inquiryBranches
            : undefined;
        inquiryStoresIDs =
          inquiryEmployeeStuff.inquiryStores &&
          inquiryEmployeeStuff.inquiryStores.length > 0
            ? inquiryEmployeeStuff.inquiryStores
            : undefined;
      }
    }
    if (user.role === "CLIENT_ASSISTANT") {
      inquiryStoresIDs = employee?.managedStores.map((s) => s.id);
    }
    if (user.role === "EMPLOYEE_CLIENT_ASSISTANT") {
      inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
    }

    const result = await prisma.message.updateMany({
      where: {
        seenByClient: user.role === "CLIENT" ? false : undefined,
        seenByClientAssistant:
          user.role === "CLIENT_ASSISTANT" ||
          user.role === "EMPLOYEE_CLIENT_ASSISTANT"
            ? false
            : undefined,
        seenByDelivery: user.role === "DELIVERY_AGENT" ? false : undefined,
        seenByBranchManager: user.role === "BRANCH_MANAGER" ? false : undefined,
        seenByCompanyManager:
          user.role === "COMPANY_MANAGER" ? false : undefined,
        seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? false : undefined,
        Chat: {
          Order:
            user.role === "INQUIRY_EMPLOYEE"
              ? {
                  AND: [
                    {
                      status: inquiryStatuses
                        ? {
                            in: inquiryStatuses,
                          }
                        : undefined,
                    },
                    {
                      governorate: inquiryGovernorates
                        ? {
                            in: inquiryGovernorates,
                          }
                        : undefined,
                    },
                    {
                      branch: inquiryBranchesIDs
                        ? {
                            id: {
                              in: inquiryBranchesIDs,
                            },
                          }
                        : undefined,
                    },
                    {
                      store: inquiryStoresIDs
                        ? {
                            id: {
                              in: inquiryStoresIDs,
                            },
                          }
                        : undefined,
                    },
                    {
                      company: {
                        id: user.companyID,
                      },
                    },
                    {
                      location: inquiryLocationsIDs
                        ? {
                            id: {
                              in: inquiryLocationsIDs,
                            },
                          }
                        : undefined,
                    },
                  ],
                }
              : {
                  clientId: user.role === "CLIENT" ? user.id : undefined,
                  companyId: user?.companyID || undefined,
                  branchId:
                    user.role === "BRANCH_MANAGER"
                      ? employee?.branchId
                      : undefined,
                  deliveryAgentId:
                    user.role === "DELIVERY_AGENT" ? user.id : undefined,
                  storeId:
                    user.role === "CLIENT_ASSISTANT"
                      ? {in: inquiryStoresIDs}
                      : undefined,
                },
        },
      },
      data: {
        seenByClient: user.role === "CLIENT" ? true : undefined,
        seenByClientAssistant:
          user.role === "CLIENT_ASSISTANT" ||
          user.role === "EMPLOYEE_CLIENT_ASSISTANT"
            ? true
            : undefined,
        seenByDelivery: user.role === "DELIVERY_AGENT" ? true : undefined,
        seenByBranchManager: user.role === "BRANCH_MANAGER" ? true : undefined,
        seenByCompanyManager:
          user.role === "COMPANY_MANAGER" ? true : undefined,
        seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? true : undefined,
      },
    });
    res.status(200).json({message: "success"});
  });

  deleteMessages = catchAsync(async (req, res) => {
    const user = res.locals.user as loggedInUserType;
    const {ids} = req.body;
    if (!ids || ids.length === 0) {
      throw new AppError("ليس هناك رسائل", 400);
    }

    // Fetch messages to validate ownership
    const messages = await prisma.message.findMany({
      where: {id: {in: ids}},
      select: {
        id: true,
        createdById: true,
        chatId: true,
        Chat: {
          select: {
            orderId: true,
          },
        },
      },
    });

    io.to(`chat_${messages[0].Chat?.orderId}`).emit("newChatMessage", "");

    // Delete them
    await prisma.message.deleteMany({
      where: {
        id: {in: ids},
        createdById: user.id,
      },
    });

    res.status(200).json({message: "success"});
  });
}
