"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesController = void 0;
const db_1 = require("../../database/db");
const catchAsync_1 = require("../../lib/catchAsync");
const sendNotification_1 = require("../notifications/helpers/sendNotification");
const employees_repository_1 = require("../employees/employees.repository");
const server_1 = require("../../server");
const AppError_1 = require("../../lib/AppError");
const employeesRepository = new employees_repository_1.EmployeesRepository();
class MessagesController {
    async getOrderInquiryEmployees(data) {
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: data.orderID,
            },
            select: {
                branchId: true,
                storeId: true,
                companyId: true,
                locationId: true,
                status: true,
                governorate: true,
                client: {
                    select: {
                        branchId: true,
                    },
                },
                deliveryAgent: {
                    select: {
                        id: true,
                    },
                },
                location: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!order) {
            throw new AppError_1.AppError("الطلب غير موجود", 404);
        }
        const orderInquiryEmployees = [];
        (await db_1.prisma.employee.findMany({
            where: {
                AND: [
                    { role: "INQUIRY_EMPLOYEE" },
                    {
                        OR: [
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.client.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: "receiving",
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: "forwarded",
                                inquiryBranches: {
                                    some: {
                                        branchId: {
                                            in: [order.client.branchId],
                                        },
                                    },
                                },
                            },
                            {
                                branch: {
                                    repositories: {
                                        some: {
                                            mainRepository: true,
                                        },
                                    },
                                },
                                orderType: null,
                                inquiryBranches: {
                                    none: {},
                                },
                            },
                        ],
                    },
                ],
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
                inquiryStatuses: true,
                inquiryGovernorates: true,
                inquiryLocations: true,
                inquiryStores: true,
                inquiryDeliveryAgents: true,
                role: true,
            },
        })).forEach((inquiryEmployee) => {
            const inquiryLocation = inquiryEmployee.inquiryLocations.find((e) => e.locationId === order.locationId);
            const inquiryStore = inquiryEmployee.inquiryStores.find((e) => e.storeId === order.storeId);
            const inquiryDelivery = inquiryEmployee.inquiryDeliveryAgents.find((e) => e.deliveryAgentId === order.deliveryAgent?.id);
            if (inquiryEmployee.inquiryStatuses.length > 0 &&
                !inquiryEmployee.inquiryStatuses.includes(order?.status)) {
                return;
            }
            if (inquiryEmployee.inquiryGovernorates.length > 0 &&
                !inquiryEmployee.inquiryGovernorates.includes(order?.governorate)) {
                return;
            }
            if (inquiryEmployee.inquiryStores.length > 0 && !inquiryStore) {
                return;
            }
            if (inquiryEmployee.inquiryLocations.length > 0 && !inquiryLocation) {
                return;
            }
            if (inquiryEmployee.inquiryDeliveryAgents.length > 0 &&
                order.deliveryAgent &&
                !inquiryDelivery) {
                return;
            }
            orderInquiryEmployees.push({
                id: inquiryEmployee.user?.id ?? null,
                name: inquiryEmployee.user?.name ?? null,
                phone: inquiryEmployee.user?.phone ?? null,
                avatar: inquiryEmployee.user?.avatar ?? null,
                role: inquiryEmployee.role,
            });
        }) ?? [];
        return orderInquiryEmployees;
    }
    getOrderChatMembers = async (orderId) => {
        let chatMembers = [];
        if (!orderId) {
            return chatMembers;
        }
        const order = await db_1.prisma.order.findUnique({
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
        const companyManagers = await db_1.prisma.employee.findMany({
            where: {
                role: "COMPANY_MANAGER",
                companyId: order?.companyId,
            },
            select: {
                id: true,
            },
        });
        const branchManagers = await db_1.prisma.employee.findMany({
            where: {
                role: "BRANCH_MANAGER",
                branchId: order?.branchId,
            },
            select: {
                id: true,
            },
        });
        const inquiryEmployees = await this.getOrderInquiryEmployees({
            orderID: orderId,
        });
        const clientAssistant = await db_1.prisma.employee.findMany({
            where: {
                AND: [
                    { role: { in: ["CLIENT_ASSISTANT", "EMPLOYEE_CLIENT_ASSISTANT"] } },
                    {
                        OR: [
                            {
                                clientId: order?.clientId,
                            },
                            {
                                inquiryStores: {
                                    some: {
                                        storeId: order?.storeId,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                orderStatus: true,
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
            if (order?.status && e.orderStatus.includes(order.status)) {
                chatMembers.push(e.id);
            }
        });
        order?.clientId && chatMembers.push(order?.clientId);
        order?.deliveryAgentId && chatMembers.push(order?.deliveryAgentId);
        return chatMembers;
    };
    getUserChats = async (user, size, page, status, unRead) => {
        const employee = await db_1.prisma.employee.findUnique({
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
                mainEmergency: true,
            },
        });
        let inquiryStatuses = undefined;
        let inquiryGovernorates = undefined;
        let inquiryLocationsIDs = undefined;
        let inquiryBranchesIDs = undefined;
        let inquiryStoresIDs = undefined;
        let orderType = undefined;
        if (user.role === "INQUIRY_EMPLOYEE") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: +user.id,
            });
            if (inquiryEmployeeStuff) {
                orderType = inquiryEmployeeStuff.orderType || undefined;
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
        if (user.role === "CLIENT_ASSISTANT" &&
            !employee?.permissions.includes("MESSAGES")) {
            return {
                totalUnSeened: 0,
                pageCounts: 0,
                count: 0,
                page: 1,
                chats: [],
            };
        }
        if (user.role === "EMPLOYEE_CLIENT_ASSISTANT" &&
            !employee?.permissions.includes("MESSAGES")) {
            return {
                totalUnSeened: 0,
                pageCounts: 0,
                count: 0,
                page: 1,
                chats: [],
            };
        }
        if (user.role === "CLIENT_ASSISTANT") {
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        if (user.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        const chats = await db_1.prisma.chat.findManyPaginated({
            where: {
                messages: unRead === "true"
                    ? {
                        some: {
                            seenByClient: user.role === "CLIENT" ? false : undefined,
                            seenByClientAssistant: user.role === "CLIENT_ASSISTANT" ||
                                user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                                ? false
                                : undefined,
                            seenByDelivery: user.role === "DELIVERY_AGENT" ? false : undefined,
                            seenByBranchManager: user.role === "BRANCH_MANAGER" ? false : undefined,
                            seenByCompanyManager: user.role === "COMPANY_MANAGER" ? false : undefined,
                            seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? false : undefined,
                        },
                    }
                    : {
                        some: {}, // Only include chats that have at least one message
                    },
                Order: user.role === "INQUIRY_EMPLOYEE"
                    ? {
                        AND: [
                            {
                                status: status && status !== "null"
                                    ? status
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
                                branch: orderType
                                    ? undefined
                                    : inquiryBranchesIDs
                                        ? {
                                            id: {
                                                in: inquiryBranchesIDs,
                                            },
                                        }
                                        : employee?.mainEmergency
                                            ? undefined
                                            : {
                                                id: employee?.branchId,
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
                            {
                                forwardedBranchId: orderType === "forwarded" && inquiryBranchesIDs
                                    ? { in: inquiryBranchesIDs }
                                    : orderType === "forwarded"
                                        ? employee?.branchId
                                        : undefined,
                            },
                            {
                                receivedBranchId: orderType === "receiving" && inquiryBranchesIDs
                                    ? { in: inquiryBranchesIDs }
                                    : orderType === "receiving"
                                        ? employee?.branchId
                                        : undefined,
                            },
                        ],
                    }
                    : {
                        status: status && status !== "null"
                            ? status
                            : user.role === "CLIENT_ASSISTANT" ||
                                user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                                ? { in: employee?.orderStatus }
                                : undefined,
                        clientId: user.role === "CLIENT" ? user.id : undefined,
                        companyId: user?.companyID || undefined,
                        branchId: user.role !== "COMPANY_MANAGER" &&
                            user.role !== "CLIENT_ASSISTANT" &&
                            user.role !== "EMPLOYEE_CLIENT_ASSISTANT" &&
                            !user.mainRepository &&
                            user.role !== "DELIVERY_AGENT" &&
                            user.role !== "BRANCH_MANAGER"
                            ? employee?.branchId
                            : undefined,
                        deliveryAgentId: user.role === "DELIVERY_AGENT" ? user.id : undefined,
                        storeId: user.role === "CLIENT_ASSISTANT" ||
                            user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                            ? { in: inquiryStoresIDs }
                            : undefined,
                        OR: user.role === "BRANCH_MANAGER"
                            ? [
                                {
                                    branch: {
                                        id: employee?.branchId,
                                    },
                                },
                                {
                                    client: {
                                        branchId: employee?.branchId,
                                    },
                                },
                            ]
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
        }, {
            page,
            size,
        });
        const unSeenChats = await db_1.prisma.message.groupBy({
            by: ["chatId"],
            _count: {
                id: true,
            },
            where: {
                seenByClient: user.role === "CLIENT" ? false : undefined,
                seenByClientAssistant: user.role === "CLIENT_ASSISTANT" ||
                    user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                    ? false
                    : undefined,
                seenByDelivery: user.role === "DELIVERY_AGENT" ? false : undefined,
                seenByBranchManager: user.role === "BRANCH_MANAGER" ? false : undefined,
                seenByCompanyManager: user.role === "COMPANY_MANAGER" ? false : undefined,
                seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? false : undefined,
                Chat: {
                    Order: user.role === "INQUIRY_EMPLOYEE"
                        ? {
                            AND: [
                                {
                                    status: status && status !== "null"
                                        ? status
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
                                    branch: orderType
                                        ? undefined
                                        : inquiryBranchesIDs
                                            ? {
                                                id: {
                                                    in: inquiryBranchesIDs,
                                                },
                                            }
                                            : employee?.mainEmergency
                                                ? undefined
                                                : {
                                                    id: employee?.branchId,
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
                                {
                                    forwardedBranchId: orderType === "forwarded" && inquiryBranchesIDs
                                        ? { in: inquiryBranchesIDs }
                                        : orderType === "forwarded"
                                            ? employee?.branchId
                                            : undefined,
                                },
                                {
                                    receivedBranchId: orderType === "receiving" && inquiryBranchesIDs
                                        ? { in: inquiryBranchesIDs }
                                        : orderType === "receiving"
                                            ? employee?.branchId
                                            : undefined,
                                },
                            ],
                        }
                        : {
                            clientId: user.role === "CLIENT" ? user.id : undefined,
                            companyId: user?.companyID || undefined,
                            branchId: user.role !== "COMPANY_MANAGER" &&
                                user.role !== "CLIENT_ASSISTANT" &&
                                user.role !== "EMPLOYEE_CLIENT_ASSISTANT" &&
                                user.role !== "BRANCH_MANAGER" &&
                                user.role !== "DELIVERY_AGENT"
                                ? employee?.branchId
                                : undefined,
                            deliveryAgentId: user.role === "DELIVERY_AGENT" ? user.id : undefined,
                            storeId: user.role === "CLIENT_ASSISTANT" ||
                                user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                                ? { in: inquiryStoresIDs }
                                : undefined,
                            OR: user.role === "BRANCH_MANAGER"
                                ? [
                                    {
                                        branch: {
                                            id: employee?.branchId,
                                        },
                                    },
                                    {
                                        client: {
                                            branchId: employee?.branchId,
                                        },
                                    },
                                ]
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
                unseenMessages: unSeenChats.find((c) => c.chatId === e.id)?._count.id || 0,
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
    getChatMessages = async (orderId, userId) => {
        const employee = await db_1.prisma.employee.findUnique({
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
        await db_1.prisma.message.updateMany({
            where: {
                Chat: {
                    orderId: orderId,
                },
            },
            data: {
                seenByClient: employee ? undefined : true,
                seenByDelivery: employee?.role === "DELIVERY_AGENT" ? true : undefined,
                seenByClientAssistant: employee?.role === "CLIENT_ASSISTANT" ||
                    employee?.role === "EMPLOYEE_CLIENT_ASSISTANT"
                    ? true
                    : undefined,
                seenByBranchManager: employee?.role === "BRANCH_MANAGER" ? true : undefined,
                seenByCompanyManager: employee?.role === "COMPANY_MANAGER" ? true : undefined,
                seenByCallCenter: employee?.role === "INQUIRY_EMPLOYEE" ? true : undefined,
            },
        });
        const messages = await db_1.prisma.message.findMany({
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
    sendMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { content, orderId } = req.body;
        const loggedInUser = res.locals.user;
        let image;
        const order = await db_1.prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: {
                id: true,
                receiptNumber: true,
            },
        });
        if (loggedInUser.role === "CLIENT_ASSISTANT" ||
            loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            const clientAssistant = await db_1.prisma.employee.findUnique({
                where: {
                    id: loggedInUser.id,
                },
                select: {
                    permissions: true,
                },
            });
            if (!clientAssistant?.permissions.includes("MESSAGES")) {
                throw new AppError_1.AppError("ليس لديك صلاحيه", 400);
            }
        }
        if (req.file) {
            const file = req.file;
            image = file.location;
        }
        let chat = await db_1.prisma.chat.findFirst({
            where: {
                orderId: orderId,
            },
            select: {
                id: true,
                orderId: true,
                numberOfMessages: true,
                Order: {
                    select: {
                        receiptNumber: true,
                    },
                },
            },
        });
        if (!chat) {
            chat = await db_1.prisma.chat.create({
                data: {
                    orderId: orderId,
                    numberOfMessages: 0,
                },
                select: {
                    id: true,
                    orderId: true,
                    numberOfMessages: true,
                    Order: {
                        select: {
                            receiptNumber: true,
                        },
                    },
                },
            });
        }
        await db_1.prisma.chat.update({
            where: {
                id: chat.id,
            },
            data: {
                numberOfMessages: chat.numberOfMessages + 1,
            },
        });
        const message = await db_1.prisma.message.create({
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
                seenByClientAssistant: loggedInUser.role === "CLIENT_ASSISTANT" ||
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
        server_1.io.to(`chat_${chat.orderId}`).emit("newChatMessage", {
            ...message,
            chatId: chat.id,
        });
        chatMembers.forEach((member) => {
            server_1.io.to(`${member}`).emit("newMessage", {
                ...message,
                chatId: chat.id,
                orderId: chat.orderId,
                receiptNumber: chat.Order?.receiptNumber,
            });
        });
        // const chats=await this.getUserChats(loggedInUser.id)
        chatMembers.forEach(async (e) => {
            await (0, sendNotification_1.sendNotification)({
                title: `رساله جديده "${content}"`,
                content: `هناك رساله جديده للطلب رقم ${orderId}`,
                userID: e,
                orderId: order?.id,
                chatId: chat.id,
                receiptNumber: order?.receiptNumber,
                forChat: true,
            });
        });
        res.status(201).json({ message: "success" });
    });
    getUserChatStatics = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const { size, page, status, unRead } = req.query;
        const chats = await this.getUserChats(loggedInUser, size ? +size : 20, page ? +page : 1, typeof status === "string" ? status : undefined, unRead + "");
        res.status(201).json({ ...chats });
    });
    getUserChatMessages = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const loggedInUser = res.locals.user;
        const { orderId } = req.query;
        if (!orderId) {
            return;
        }
        const chats = await this.getChatMessages(orderId?.toString(), loggedInUser.id);
        res.status(201).json({ ...chats });
    });
    markAllSeen = (0, catchAsync_1.catchAsync)(async (_req, res) => {
        const user = res.locals.user;
        const employee = await db_1.prisma.employee.findUnique({
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
        let inquiryStatuses = undefined;
        let inquiryGovernorates = undefined;
        let inquiryLocationsIDs = undefined;
        let inquiryBranchesIDs = undefined;
        let inquiryStoresIDs = undefined;
        if (user.role === "INQUIRY_EMPLOYEE") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
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
        await db_1.prisma.message.updateMany({
            where: {
                seenByClient: user.role === "CLIENT" ? false : undefined,
                seenByClientAssistant: user.role === "CLIENT_ASSISTANT" ||
                    user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                    ? false
                    : undefined,
                seenByDelivery: user.role === "DELIVERY_AGENT" ? false : undefined,
                seenByBranchManager: user.role === "BRANCH_MANAGER" ? false : undefined,
                seenByCompanyManager: user.role === "COMPANY_MANAGER" ? false : undefined,
                seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? false : undefined,
                Chat: {
                    Order: user.role === "INQUIRY_EMPLOYEE"
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
                            branchId: user.role === "BRANCH_MANAGER"
                                ? employee?.branchId
                                : undefined,
                            deliveryAgentId: user.role === "DELIVERY_AGENT" ? user.id : undefined,
                            storeId: user.role === "CLIENT_ASSISTANT"
                                ? { in: inquiryStoresIDs }
                                : undefined,
                        },
                },
            },
            data: {
                seenByClient: user.role === "CLIENT" ? true : undefined,
                seenByClientAssistant: user.role === "CLIENT_ASSISTANT" ||
                    user.role === "EMPLOYEE_CLIENT_ASSISTANT"
                    ? true
                    : undefined,
                seenByDelivery: user.role === "DELIVERY_AGENT" ? true : undefined,
                seenByBranchManager: user.role === "BRANCH_MANAGER" ? true : undefined,
                seenByCompanyManager: user.role === "COMPANY_MANAGER" ? true : undefined,
                seenByCallCenter: user.role === "INQUIRY_EMPLOYEE" ? true : undefined,
            },
        });
        res.status(200).json({ message: "success" });
    });
    deleteMessages = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = res.locals.user;
        const { ids } = req.body;
        if (!ids || ids.length === 0) {
            throw new AppError_1.AppError("ليس هناك رسائل", 400);
        }
        // Fetch messages to validate ownership
        const messages = await db_1.prisma.message.findMany({
            where: { id: { in: ids } },
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
        server_1.io.to(`chat_${messages[0].Chat?.orderId}`).emit("newChatMessage", "");
        // Delete them
        await db_1.prisma.message.deleteMany({
            where: {
                id: { in: ids },
                createdById: user.id,
            },
        });
        res.status(200).json({ message: "success" });
    });
}
exports.MessagesController = MessagesController;
//# sourceMappingURL=messages.controller.js.map