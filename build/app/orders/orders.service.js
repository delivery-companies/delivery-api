"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../lib/AppError");
const localize_1 = require("../../lib/localize");
const logger_1 = require("../../lib/logger");
// import { generateReceipts } from "./helpers/generateReceipts";
const branches_repository_1 = require("../branches/branches.repository");
const clients_repository_1 = require("../clients/clients.repository");
const employees_repository_1 = require("../employees/employees.repository");
const sendNotification_1 = require("../notifications/helpers/sendNotification");
const generateOrdersReport_1 = require("./helpers/generateOrdersReport");
const generateReceipts_1 = require("./helpers/generateReceipts");
const orders_repository_1 = require("./orders.repository");
const orders_responses_1 = require("./orders.responses");
const db_1 = require("../../database/db");
const ordersRepository = new orders_repository_1.OrdersRepository();
const employeesRepository = new employees_repository_1.EmployeesRepository();
const clientsRepository = new clients_repository_1.ClientsRepository();
const branchesRepository = new branches_repository_1.BranchesRepository();
class OrdersService {
    createOrder = async (data) => {
        let confirmed;
        let status;
        if (data.loggedInUser.role === "CLIENT" ||
            data.loggedInUser.role === "CLIENT_ASSISTANT") {
            confirmed = false;
            status = client_1.OrderStatus.REGISTERED;
        }
        else {
            confirmed = true;
            status = client_1.OrderStatus.WITH_DELIVERY_AGENT;
        }
        if (Array.isArray(data.orderOrOrdersData)) {
            const createdOrders = [];
            for (const order of data.orderOrOrdersData) {
                const clientID = await clientsRepository.getClientIDByStoreID({
                    storeID: order.storeID,
                });
                if (!clientID) {
                    throw new AppError_1.AppError("حصل حطأ في ايجاد صاحب المتجر", 500);
                }
                // const deliveryAgentID = await employeesRepository.getDeliveryAgentIDByLocationID({
                //     locationID: order.locationID
                // });
                let branchID = undefined;
                const branch = await branchesRepository.getBranchByLocation({
                    locationID: order.locationID,
                });
                if (!branch) {
                    throw new AppError_1.AppError("لا يوجد فرع مرتبط بالموقع", 500);
                }
                branchID = branch.id;
                const createdOrder = await ordersRepository.createOrder({
                    companyID: data.loggedInUser.companyID,
                    clientID,
                    loggedInUser: data.loggedInUser,
                    orderData: { ...order, confirmed, status, branchID },
                });
                if (!createdOrder) {
                    throw new AppError_1.AppError("Failed to create order", 500);
                }
                // @ts-expect-error Fix later
                createdOrders.push(createdOrder);
                // Update Order Timeline
                try {
                    // order created
                    if (createdOrder) {
                        await ordersRepository.updateOrderTimeline({
                            orderID: createdOrder.id,
                            data: {
                                type: "ORDER_CREATION",
                                date: createdOrder.createdAt,
                                old: null,
                                new: null,
                                by: {
                                    id: data.loggedInUser.id,
                                    name: data.loggedInUser.name,
                                },
                                message: `تم إنشاء الطلب من قبل ${data.loggedInUser.role === "CLIENT" ? "العميل" : "الموظف"} ${data.loggedInUser.name}`,
                            },
                        });
                    }
                }
                catch (error) {
                    logger_1.Logger.error(error);
                }
            }
            return createdOrders;
        }
        const clientID = await clientsRepository.getClientIDByStoreID({
            storeID: data.orderOrOrdersData.storeID,
        });
        if (!clientID) {
            throw new AppError_1.AppError("حصل خطأ في ايجاد صاحب المتجر", 500);
        }
        if (data.orderOrOrdersData.clientOrderReceiptId) {
            const clientReceipt = await db_1.prisma.clientOrderReceipt.findFirst({
                where: {
                    receiptNumber: data.orderOrOrdersData.clientOrderReceiptId,
                },
                select: {
                    id: true,
                    receiptNumber: true,
                    storeId: true,
                    branchId: true,
                    notes: true,
                    store: {
                        select: {
                            clientId: true,
                        },
                    },
                    order: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
            if (clientReceipt?.order) {
                throw new AppError_1.AppError("تم اضافه الوصل مسبق", 500);
            }
            if (!clientReceipt?.store &&
                data.loggedInUser.branchId !== clientReceipt?.branchId) {
                throw new AppError_1.AppError("رقم الوصل غير صالح", 500);
            }
            if (clientReceipt?.store && clientID !== clientReceipt?.store?.clientId) {
                throw new AppError_1.AppError("رقم الوصل غير صالح", 500);
            }
            data.orderOrOrdersData.receiptNumber = clientReceipt?.receiptNumber;
            data.orderOrOrdersData.notes = clientReceipt?.notes || "";
            data.orderOrOrdersData.clientOrderReceiptId = clientReceipt?.id + "";
        }
        let branchID = undefined;
        const branch = await branchesRepository.getBranchByLocation({
            locationID: data.orderOrOrdersData.locationID,
        });
        if (!branch) {
            throw new AppError_1.AppError("لا يوجد فرع مرتبط بالموقع", 500);
        }
        branchID = branch.id;
        const createdOrder = await ordersRepository.createOrder({
            companyID: data.loggedInUser.companyID,
            clientID,
            loggedInUser: data.loggedInUser,
            orderData: { ...data.orderOrOrdersData, confirmed, status, branchID },
        });
        // Update Order Timeline
        try {
            // order created
            if (createdOrder) {
                await ordersRepository.updateOrderTimeline({
                    orderID: createdOrder.id,
                    data: {
                        type: "ORDER_CREATION",
                        date: createdOrder.createdAt,
                        old: null,
                        new: null,
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: `تم إنشاء الطلب من قبل ${data.loggedInUser.role === "CLIENT" ? "العميل" : "الموظف"} ${data.loggedInUser.name}`,
                    },
                });
            }
        }
        catch (error) {
            logger_1.Logger.error(error);
        }
        return createdOrder;
    };
    getAllOrders = async (data) => {
        const clientID = data.loggedInUser.role === "CLIENT"
            ? data.loggedInUser.id
            : data.loggedInUser.role === "CLIENT_ASSISTANT"
                ? data.loggedInUser.clientId
                : data.filters.clientID;
        const deliveryAgentID = data.loggedInUser.role === client_1.EmployeeRole.DELIVERY_AGENT
            ? data.loggedInUser.id
            : data.filters.deliveryAgentID;
        const companyID = data.filters.companyID
            ? data.filters.companyID
            : data.loggedInUser.companyID || undefined;
        // Show only orders of the same governorate as the branch to the branch manager
        let governorate = data.filters.governorate;
        let branchID = data.filters.branchID;
        if (data.loggedInUser.role !== client_1.EmployeeRole.COMPANY_MANAGER &&
            data.loggedInUser.role !== client_1.AdminRole.ADMIN &&
            data.loggedInUser.role !== client_1.AdminRole.ADMIN_ASSISTANT &&
            data.loggedInUser.role !== client_1.ClientRole.CLIENT &&
            data.loggedInUser.role !== client_1.EmployeeRole.CLIENT_ASSISTANT &&
            data.loggedInUser.role !== client_1.EmployeeRole.ACCOUNTANT &&
            data.loggedInUser.role !== client_1.EmployeeRole.RECEIVING_AGENT &&
            data.loggedInUser.role !== client_1.EmployeeRole.ACCOUNT_MANAGER &&
            !data.filters.orderType &&
            !data.loggedInUser.mainRepository) {
            const branch = await branchesRepository.getBranchManagerBranch({
                branchManagerID: data.loggedInUser.id,
            });
            if (!branch) {
                throw new AppError_1.AppError("انت غير مرتبط بفرع", 500);
            }
            // TODO: Every branch should have a governorate
            if (!branch.governorate) {
                throw new AppError_1.AppError("الفرع الذي تعمل به غير مرتبط بمحافظة", 500);
            }
            // governorate = data.filters.orderType ? undefined : branch.governorate;
            branchID = branch.id;
        }
        // show orders/statistics without client reports to the client unless he searches for them
        let clientReport = data.filters.clientReport;
        let deliveryAgentReport = data.filters.deliveryAgentReport;
        // Inquiry Employee Filters
        let inquiryStatuses = undefined;
        let inquiryGovernorates = undefined;
        let inquiryLocationsIDs = undefined;
        let inquiryBranchesIDs = undefined;
        let inquiryStoresIDs = undefined;
        let inquiryCompaniesIDs = undefined;
        let inquiryClientsIDs = undefined;
        let inquiryDeliveryAgentIDs = undefined;
        let orderType = data.filters.orderType;
        if (data.loggedInUser.role === "RECEIVING_AGENT") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: data.loggedInUser.id,
            });
            inquiryClientsIDs =
                inquiryEmployeeStuff.inquiryClients &&
                    inquiryEmployeeStuff.inquiryClients.length > 0
                    ? inquiryEmployeeStuff.inquiryClients
                    : undefined;
        }
        if (data.loggedInUser.role === "INQUIRY_EMPLOYEE") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: data.loggedInUser.id,
            });
            if (inquiryEmployeeStuff) {
                // if all filters are empty, that means he shouldnt see any orders
                if (inquiryEmployeeStuff.inquiryBranches?.length === 0 &&
                    inquiryEmployeeStuff.inquiryLocations?.length === 0 &&
                    inquiryEmployeeStuff.inquiryCompanies?.length === 0 &&
                    inquiryEmployeeStuff.inquiryStores?.length === 0 &&
                    inquiryEmployeeStuff.inquiryGovernorates?.length === 0 &&
                    inquiryEmployeeStuff.inquiryDeliveryAgents?.length === 0 &&
                    inquiryEmployeeStuff.inquiryStatuses?.length === 0) {
                    // TODO: Improve this
                    return {
                        page: data.filters.page,
                        pagesCount: 0,
                        orders: [],
                        ordersMetaData: {
                            totalCost: 0,
                            totalPaidAmount: 0,
                            totalUnpaidAmount: 0,
                            totalOrdersCount: 0,
                            totalDeliveredOrdersCount: 0,
                            totalReturnedOrdersCount: 0,
                            totalReplacedOrdersCount: 0,
                            totalUnDeliveredOrdersCount: 0,
                            totalUnReturnedOrdersCount: 0,
                            totalUnReplacedOrdersCount: 0,
                        },
                    };
                }
                orderType = inquiryEmployeeStuff.orderType || data.filters.orderType;
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
                inquiryDeliveryAgentIDs =
                    inquiryEmployeeStuff.inquiryDeliveryAgents &&
                        inquiryEmployeeStuff.inquiryDeliveryAgents.length > 0
                        ? inquiryEmployeeStuff.inquiryDeliveryAgents
                        : undefined;
                inquiryCompaniesIDs =
                    inquiryEmployeeStuff.inquiryCompanies &&
                        inquiryEmployeeStuff.inquiryCompanies.length > 0
                        ? inquiryEmployeeStuff.inquiryCompanies
                        : undefined;
            }
        }
        if (data.loggedInUser.role === "CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        if (data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        let size = data.filters.size || 500;
        const { orders, ordersMetaData, pagesCount } = await ordersRepository.getAllOrdersPaginated({
            filters: {
                ...data.filters,
                clientID,
                deliveryAgentID,
                companyID,
                governorate,
                branchID,
                clientReport,
                deliveryAgentReport,
                size,
                inquiryStatuses,
                inquiryGovernorates,
                inquiryLocationsIDs,
                inquiryBranchesIDs,
                inquiryStoresIDs,
                inquiryCompaniesIDs,
                inquiryClientsIDs,
                inquiryDeliveryAgentsIDs: inquiryDeliveryAgentIDs,
                orderType,
            },
            loggedInUser: data.loggedInUser,
        });
        return {
            page: data.filters.page,
            pagesCount: pagesCount,
            orders: orders,
            ordersMetaData: ordersMetaData,
        };
    };
    getAllOrdersApiKey = async (data) => {
        const clientID = data.loggedInUser.clientId;
        // Show only orders of the same governorate as the branch to the branch manager
        let governorate = data.filters.governorate;
        // show orders/statistics without client reports to the client unless he searches for them
        let clientReport = data.filters.clientReport;
        let size = data.filters.size || 200;
        const { orders, ordersMetaData, pagesCount } = await ordersRepository.getAllOrdersPaginatedApiKey({
            filters: {
                ...data.filters,
                clientID,
                governorate,
                clientReport,
                size,
            },
            loggedInUser: data.loggedInUser,
        });
        return {
            page: data.filters.page,
            pagesCount: pagesCount,
            orders: orders,
            ordersMetaData: ordersMetaData,
        };
    };
    getOrder = async (data) => {
        const order = await ordersRepository.getOrder({
            orderID: data.params.orderID,
        });
        return order;
    };
    getOrderById = async (data) => {
        const order = await ordersRepository.getOrderById({
            orderID: data.params.orderID,
        });
        return order;
    };
    getOrderByIdApiKey = async (data) => {
        const order = await ordersRepository.getOrderByIdApiKey({
            orderID: data.params.orderID,
        });
        return order;
    };
    updateOrder = async (data) => {
        if (data.loggedInUser.role !== "COMPANY_MANAGER" &&
            data.loggedInUser.role !== "BRANCH_MANAGER" &&
            data.loggedInUser.permissions?.includes("CHANGE_ORDER_DATA") !== true &&
            data.loggedInUser.role !== "CLIENT") {
            throw new AppError_1.AppError("ليس لديك صلاحية تعديل الطلب", 403);
        }
        if (!data.loggedInUser.permissions?.includes("CHANGE_ORDER_PAID_AMOUNT") &&
            data.orderData.paidAmount &&
            data.loggedInUser.role !== "COMPANY_MANAGER") {
            throw new AppError_1.AppError("ليس لديك صلاحية تعديل المبلغ المدفوع", 403);
        }
        let oldOrderData = await ordersRepository.getOrderById({
            orderID: data.params.orderID,
        });
        if (!oldOrderData) {
            oldOrderData = await ordersRepository.getOrderByReceiptNumber({
                orderReceiptNumber: data.params.orderID,
            });
            if (!oldOrderData) {
                throw new AppError_1.AppError("الطلب غير موجود", 404);
            }
        }
        // update order paid amount if new status is delivered or partially returned or replaced
        if (oldOrderData?.status !== data.orderData.status &&
            !data.orderData.paidAmount &&
            data.orderData.paidAmount !== 0 &&
            (data.orderData.status === client_1.OrderStatus.DELIVERED ||
                data.orderData.status === client_1.OrderStatus.PARTIALLY_RETURNED ||
                data.orderData.status === client_1.OrderStatus.REPLACED) &&
            oldOrderData.paidAmount === 0) {
            data.orderData.paidAmount = oldOrderData?.totalCost;
        }
        // update order total amount and paid amount if new status is returned
        if ((oldOrderData?.status !== data.orderData.status &&
            data.orderData.status === client_1.OrderStatus.RETURNED) ||
            (data.orderData.paidAmount &&
                data.orderData.status &&
                data.orderData.status !== client_1.OrderStatus.PARTIALLY_RETURNED &&
                data.orderData.status !== client_1.OrderStatus.REPLACED &&
                data.orderData.status !== client_1.OrderStatus.DELIVERED)) {
            // data.orderData.totalCost = 0;
            data.orderData.paidAmount = 0;
        }
        if (data.orderData.status &&
            oldOrderData?.status !== data.orderData.status) {
            // data.orderData.totalCost = 0;
            data.orderData.processed = false;
            data.orderData.processingStatus = "not_processed";
        }
        // if secondary status is changed to in_reposiroty, unlink the delivery agent
        if (oldOrderData?.secondaryStatus !== data.orderData.secondaryStatus &&
            data.orderData.secondaryStatus === "IN_REPOSITORY" &&
            (data.orderData.status === "IN_GOV_REPOSITORY" ||
                data.orderData.status === "IN_MAIN_REPOSITORY")) {
            data.orderData.deliveryAgentID = null;
            data.orderData.oldDeliveryAgentId = oldOrderData?.deliveryAgent?.id;
        }
        if (oldOrderData?.status === "RETURNED" &&
            data.orderData.secondaryStatus === "IN_REPOSITORY") {
            // data.orderData.deliveryAgentID = null;
            data.orderData.oldDeliveryAgentId = oldOrderData?.deliveryAgent?.id;
        }
        // If the order is being forwarded to the company, change branch to the branch connected to the order location
        if (data.orderData.forwardedCompanyID) {
            const branch = await branchesRepository.getBranchByLocation({
                locationID: oldOrderData?.location.id,
            });
            if (!branch) {
                throw new AppError_1.AppError("لا يوجد فرع مرتبط بالموقع", 500);
            }
            data.orderData.branchID = branch.id;
        }
        if (data.orderData.secondaryStatus === oldOrderData.secondaryStatus &&
            data.orderData.status === oldOrderData.status &&
            !data.orderData.deliveryAgentID &&
            !data.orderData.recipientName &&
            !data.orderData.recipientPhones &&
            !data.orderData.recipientAddress) {
            throw new AppError_1.AppError("لقد تم اضافه هذا الطلب مسبقا", 403);
        }
        if (data.orderData.status === oldOrderData.status &&
            data.orderData.deliveryAgentID === oldOrderData.deliveryAgent?.id &&
            !data.orderData.recipientName &&
            !data.orderData.recipientPhones &&
            !data.orderData.recipientAddress) {
            throw new AppError_1.AppError("لقد تم اضافه هذا الطلب مسبقا", 403);
        }
        if (data.orderData.status === oldOrderData.status &&
            data.loggedInUser.role === "RECEIVING_AGENT") {
            throw new AppError_1.AppError("لقد تم اضافه هذا الطلب مسبقا", 403);
        }
        if (data.orderData.status === "WITH_RECEIVING_AGENT" &&
            data.loggedInUser.role === "RECEIVING_AGENT") {
            data.orderData.deliveryAgentID = data.loggedInUser.id;
            data.orderData.secondaryStatus = "WITH_AGENT";
        }
        if (data.orderData.governorate &&
            data.orderData.locationID &&
            (oldOrderData.status === "REGISTERED" ||
                oldOrderData.status === "READY_TO_SEND")) {
            const branch = await branchesRepository.getBranchByLocation({
                locationID: data.orderData.locationID,
            });
            if (!branch) {
                throw new AppError_1.AppError("لا يوجد فرع مرتبط بالموقع", 500);
            }
            data.orderData.branchID = branch.id;
            // data.orderData.receivedBranchId = data.orderData.branchID;
        }
        if (data.orderData.status &&
            oldOrderData.status === "DELIVERED" &&
            !data.loggedInUser.permissions.includes("CHANGE_CLOSED_ORDER_STATUS")) {
            throw new AppError_1.AppError("لا يمكنك تغيير حاله طلبيه مغلقه", 500);
        }
        if (data.orderData.status === "WITH_DELIVERY_AGENT" &&
            oldOrderData.client.branchId !== data.loggedInUser.branchId &&
            oldOrderData.receivedBranchId !== data.loggedInUser.branchId) {
            data.orderData.receivedBranchId = data.loggedInUser.branchId;
            data.orderData.branchID = data.loggedInUser.branchId;
        }
        else if (data.orderData.status === "WITH_DELIVERY_AGENT" &&
            oldOrderData.branch?.id !== data.loggedInUser.branchId) {
            data.orderData.branchID = data.loggedInUser.branchId;
        }
        if (data.orderData.branchID) {
            if (oldOrderData.client.branchId !== data.orderData.branchID) {
                data.orderData.forwardedBranchId = oldOrderData.client.branchId;
                data.orderData.receivedBranchId = data.orderData.branchID;
            }
            else if (oldOrderData.client.branchId === data.orderData.branchID) {
                data.orderData.forwardedBranchId = -1;
                data.orderData.receivedBranchId = -1;
            }
        }
        if (oldOrderData.deliveryAgent && data.orderData.deliveryAgentID) {
            data.orderData.status = undefined;
            data.orderData.secondaryStatus = "WITH_AGENT";
        }
        const newOrder = await ordersRepository.updateOrder({
            orderID: oldOrderData.id,
            loggedInUser: data.loggedInUser,
            orderData: data.orderData,
        });
        if (!newOrder) {
            throw new AppError_1.AppError("فشل تحديث الطلب", 500);
        }
        // Update Order Timeline
        try {
            // Update status
            if ((data.orderData.status && oldOrderData.status !== newOrder.status) ||
                data.orderData.notes !== oldOrderData.notes) {
                // send notification to client
                if (data.loggedInUser.role !== "DELIVERY_AGENT" &&
                    data.loggedInUser.role !== "RECEIVING_AGENT" &&
                    newOrder.deliveryAgent) {
                    await (0, sendNotification_1.sendNotification)({
                        orderId: newOrder.id,
                        userID: newOrder.deliveryAgent?.id,
                        title: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                        content: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                    });
                }
                if (data.orderData.status === "DELIVERED" ||
                    data.orderData.status === "PARTIALLY_RETURNED" ||
                    data.orderData.status === "REPLACED" ||
                    data.orderData.status === "RETURNED" ||
                    data.orderData.status === "RESEND" ||
                    data.orderData.status === "POSTPONED" ||
                    data.orderData.status === "PROCESSING") {
                    const orderInquiryEmployees = await ordersRepository.getOrderInquiryEmployeesForNotifications({
                        orderID: oldOrderData.id,
                    });
                    const clientAssitants = await db_1.prisma.employee.findMany({
                        where: {
                            AND: [
                                { role: { in: ["CLIENT_ASSISTANT", "EMPLOYEE_CLIENT_ASSISTANT"] } },
                                {
                                    OR: [
                                        {
                                            clientId: oldOrderData.client.id,
                                        },
                                        {
                                            inquiryStores: {
                                                some: {
                                                    storeId: oldOrderData.store.id,
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
                    clientAssitants.forEach(async (e) => {
                        if (data.orderData.status &&
                            e.orderStatus.includes(data.orderData.status)) {
                            await (0, sendNotification_1.sendNotification)({
                                orderId: newOrder.id,
                                userID: e.id,
                                title: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                                content: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                            });
                        }
                    });
                    orderInquiryEmployees.forEach(async (e) => {
                        await (0, sendNotification_1.sendNotification)({
                            orderId: newOrder.id,
                            userID: e.id,
                            title: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                            content: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                        });
                    });
                    if (data.orderData.status !== "POSTPONED") {
                        await (0, sendNotification_1.sendNotification)({
                            orderId: newOrder.id,
                            userID: newOrder.client.id,
                            title: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                            content: `تم تغيير حالة الطلب رقم ${newOrder.receiptNumber} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.notes ? `(${newOrder.notes})` : ""}`,
                        });
                    }
                }
                if (newOrder.status !== "IN_GOV_REPOSITORY" &&
                    newOrder.status !== "IN_MAIN_REPOSITORY") {
                    await ordersRepository.updateOrderTimeline({
                        orderID: oldOrderData.id,
                        data: {
                            type: "STATUS_CHANGE",
                            date: newOrder.updatedAt,
                            old: { value: oldOrderData.status },
                            new: { value: newOrder.status },
                            by: { id: data.loggedInUser.id, name: data.loggedInUser.name },
                            message: newOrder.status === "WITH_RECEIVING_AGENT"
                                ? "تم استلام الطلب من العميل بواسطه مندوب الاستلام"
                                : `تم تغيير حالة الطلب من ${(0, localize_1.localizeOrderStatus)(oldOrderData.status)} إلى ${(0, localize_1.localizeOrderStatus)(newOrder.status)} ${newOrder.status === "PROCESSING" ||
                                    newOrder.status === "POSTPONED" ||
                                    newOrder.status === "RETURNED"
                                    ? newOrder.notes
                                        ? `(${newOrder.notes})`
                                        : ""
                                    : ""}`,
                        },
                    });
                }
            }
            // Update delivery agent
            if (data.orderData.deliveryAgentID &&
                oldOrderData.deliveryAgent?.id !== newOrder.deliveryAgent?.id &&
                newOrder.status !== "WITH_RECEIVING_AGENT") {
                await ordersRepository.updateOrderTimeline({
                    orderID: oldOrderData.id,
                    data: {
                        type: "DELIVERY_AGENT_CHANGE",
                        date: newOrder.updatedAt,
                        old: oldOrderData.deliveryAgent && {
                            id: oldOrderData.deliveryAgent.id,
                            name: oldOrderData.deliveryAgent.name,
                        },
                        new: newOrder.deliveryAgent && {
                            id: newOrder.deliveryAgent.id,
                            name: newOrder.deliveryAgent.name,
                        },
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: `تم تعيين مندوب التوصيل ${newOrder.deliveryAgent?.name}`,
                    },
                });
            }
            // Update CLIENT
            if (data.orderData.clientID &&
                oldOrderData.client?.id !== newOrder.client.id) {
                await ordersRepository.updateOrderTimeline({
                    orderID: oldOrderData.id,
                    data: {
                        type: "CLIENT_CHANGE",
                        date: newOrder.updatedAt,
                        old: {
                            id: oldOrderData.client.id,
                            name: oldOrderData.client.name,
                        },
                        new: {
                            id: newOrder.client.id,
                            name: newOrder.client.name,
                        },
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: `تم تغيير العميل من ${oldOrderData.client?.name} إلى ${newOrder.client.name}`,
                    },
                });
            }
            // Update Repository
            if ((data.orderData.repositoryID &&
                oldOrderData?.repository?.id !== newOrder.repository?.id) ||
                (data.orderData.secondaryStatus !== oldOrderData.secondaryStatus &&
                    data.orderData.repositoryID)) {
                await ordersRepository.updateOrderTimeline({
                    orderID: oldOrderData.id,
                    data: {
                        type: "REPOSITORY_CHANGE",
                        date: newOrder.updatedAt,
                        old: oldOrderData.repository && {
                            id: oldOrderData.repository.id,
                            name: oldOrderData.repository.name,
                        },
                        new: newOrder.repository && {
                            id: newOrder.repository.id,
                            name: newOrder.repository.name,
                        },
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: newOrder.secondaryStatus === "IN_REPOSITORY"
                            ? `تم ادخال الطلب الي مخزن ${newOrder.repository?.name}`
                            : `تم ارسال الطلب الي مخزن ${newOrder.repository?.name}`,
                    },
                });
            }
            // Update Branch
            if (data.orderData.branchID &&
                oldOrderData?.branch?.id !== newOrder.branch?.id &&
                !data.orderData.repositoryID) {
                await ordersRepository.updateOrderTimeline({
                    orderID: oldOrderData.id,
                    data: {
                        type: "BRANCH_CHANGE",
                        date: newOrder.updatedAt,
                        old: oldOrderData.branch && {
                            id: oldOrderData.branch.id,
                            name: oldOrderData.branch.name,
                        },
                        new: newOrder.branch && {
                            id: newOrder.branch.id,
                            name: newOrder.branch.name,
                        },
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: oldOrderData.branch && newOrder.branch
                            ? `تم تغيير الفرع من ${oldOrderData.branch.name} إلى ${newOrder.branch.name}`
                            : oldOrderData.branch && !newOrder.branch
                                ? `تم إلغاء الفرع ${oldOrderData.branch.name}`
                                : !oldOrderData.branch && newOrder.branch
                                    ? `تم تعيين الفرع ${newOrder.branch.name}`
                                    : "",
                    },
                });
            }
            // Update paid amount
            if ((data.orderData.paidAmount || data.orderData.paidAmount === 0) &&
                +oldOrderData.paidAmount !== +newOrder.paidAmount) {
                await ordersRepository.updateOrderTimeline({
                    orderID: oldOrderData.id,
                    data: {
                        type: "PAID_AMOUNT_CHANGE",
                        date: newOrder.updatedAt,
                        old: {
                            value: oldOrderData.paidAmount,
                        },
                        new: {
                            value: newOrder.paidAmount,
                        },
                        by: {
                            id: data.loggedInUser.id,
                            name: data.loggedInUser.name,
                        },
                        message: `تم تغيير المبلغ المدفوع من ${oldOrderData.paidAmount} إلى ${newOrder.paidAmount}`,
                    },
                });
            }
        }
        catch (error) {
            logger_1.Logger.error(error);
        }
        return newOrder;
    };
    repositoryConfirmOrderByReceiptNumber = async (data) => {
        const oldOrderData = await ordersRepository.getOrderByReceiptNumber({
            orderReceiptNumber: data.params.orderReceiptNumber,
        });
        if (!oldOrderData) {
            throw new AppError_1.AppError("الطلب غير موجود", 404);
        }
        if (oldOrderData.status !== client_1.OrderStatus.RETURNED &&
            oldOrderData.status !== client_1.OrderStatus.REPLACED &&
            oldOrderData.status !== client_1.OrderStatus.PARTIALLY_RETURNED) {
            throw new AppError_1.AppError("لا يمكن تأكيد الطلب لأن حالته ليست راجع كلي او جزئي او استبدال", 400);
        }
        const repositoryReport = oldOrderData.repositoryReport.find((r) => r.secondaryType === "RETURNED");
        // Remove the order from the repository report
        if (repositoryReport) {
            await ordersRepository.removeOrderFromRepositoryReport({
                orderID: oldOrderData.id,
                repositoryReportID: repositoryReport.id,
                orderData: {
                    totalCost: oldOrderData.totalCost,
                    paidAmount: oldOrderData.paidAmount,
                    deliveryCost: oldOrderData.deliveryCost,
                    clientNet: oldOrderData.clientNet,
                    deliveryAgentNet: oldOrderData.deliveryAgentNet,
                    companyNet: oldOrderData.companyNet,
                    governorate: oldOrderData.governorate,
                },
            });
        }
        // Update the order repository
        const newOrder = await this.updateOrder({
            params: {
                orderID: oldOrderData.id,
            },
            loggedInUser: data.loggedInUser,
            orderData: data.orderData,
        });
        return newOrder;
    };
    deleteOrder = async (data) => {
        await ordersRepository.deleteOrder({
            orderID: data.params.orderID,
        });
    };
    createOrdersReceipts = async (data) => {
        if (data.loggedInUser.role === "CLIENT" &&
            data.ordersIDs.selectedAll === true) {
            const orders = await db_1.prisma.order.findMany({
                where: {
                    status: "REGISTERED",
                    deleted: false,
                    client: {
                        id: data.loggedInUser.id,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                select: orders_responses_1.orderSelect,
            });
            await db_1.prisma.order.updateMany({
                where: {
                    status: "REGISTERED",
                    deleted: false,
                    client: {
                        id: data.loggedInUser.id,
                    },
                },
                data: {
                    printed: true,
                },
            });
            const reformedOrders = orders.map(orders_responses_1.orderReform);
            const pdf = await (0, generateReceipts_1.generateReceipts)(reformedOrders);
            return pdf;
        }
        else {
            const orders = await ordersRepository.getOrdersByIDs(data.ordersIDs);
            if (data.loggedInUser.role === "CLIENT" ||
                data.loggedInUser.role === "CLIENT_ASSISTANT") {
                const createdPdf = await db_1.prisma.savedPdf.create({
                    data: {
                        ordersCount: data.ordersIDs.ordersIDs.length,
                        clientId: data.loggedInUser.role === "CLIENT"
                            ? data.loggedInUser.id
                            : data.loggedInUser.clientId,
                    },
                });
                await db_1.prisma.order.updateMany({
                    where: {
                        id: {
                            in: data.ordersIDs.ordersIDs,
                        },
                    },
                    data: {
                        printed: true,
                        pdfId: createdPdf.id,
                    },
                });
            }
            const pdf = await (0, generateReceipts_1.generateReceipts)(orders);
            return pdf;
        }
    };
    getOrdersReportPDF = async (data) => {
        let orders;
        let ordersIDs = [];
        if (data.ordersData.ordersIDs === "*") {
            orders = (await this.getAllOrders({
                filters: { ...data.ordersFilters, size: 5000 },
                loggedInUser: data.loggedInUser,
            })).orders;
            for (const order of orders) {
                if (order) {
                    ordersIDs.push(order.id);
                }
            }
        }
        else {
            orders = await ordersRepository.getOrdersByIDs({
                ordersIDs: data.ordersData.ordersIDs,
            });
            ordersIDs = data.ordersData.ordersIDs;
        }
        if (!orders || orders.length === 0) {
            throw new AppError_1.AppError("لا يوجد طلبات لعمل التقرير", 400);
        }
        let ordersData;
        if (data.ordersData.type === "DELIVERY_AGENT_MANIFEST") {
            if (!data.ordersFilters.deliveryAgentID) {
                throw new AppError_1.AppError("يجب تحديد مندوب التوصيل لعمل التقرير", 400);
            }
            ordersData = {
                deliveryAgent: orders[0]?.deliveryAgent,
                date: new Date(),
                count: orders.length,
                baghdadCount: orders.filter((order) => order?.governorate === "BAGHDAD")
                    .length,
                governoratesCount: orders.filter((order) => order?.governorate !== "BAGHDAD").length,
                company: orders[0]?.company,
            };
        }
        else {
            ordersData = {
                date: new Date(),
                count: orders.length,
                baghdadCount: orders.filter((order) => order?.governorate === "BAGHDAD")
                    .length,
                governoratesCount: orders.filter((order) => order?.governorate !== "BAGHDAD").length,
                company: orders[0]?.company,
            };
        }
        const pdf = await (0, generateOrdersReport_1.generateOrdersReport)(data.ordersData.type, ordersData, orders);
        return pdf;
    };
    getRepositoryOrderCount = async (filters) => {
        const user = await db_1.prisma.employee.findUnique({
            where: {
                id: filters.loggedInUser.id,
            },
            select: {
                branch: {
                    select: {
                        id: true,
                        repositories: {
                            select: {
                                id: true,
                                type: true,
                                name: true,
                                mainRepository: true,
                            },
                        },
                    },
                },
            },
        });
        const exportRepo = user?.branch?.repositories.find((repo) => repo.type === "EXPORT");
        const returnRepo = user?.branch?.repositories.find((repo) => repo.type === "RETURN");
        const results = await db_1.prisma.order.count({
            where: {
                deleted: false,
                repositoryId: filters.getOutComing
                    ? undefined
                    : filters.repository_id
                        ? Number(filters.repository_id)
                        : filters.secondaryStatus === "IN_CAR"
                            ? undefined
                            : filters.status === "RETURNED"
                                ? returnRepo?.id
                                : exportRepo?.id,
                secondaryStatus: filters.secondaryStatus,
                status: filters.status === "RETURNED"
                    ? { in: ["RETURNED", "PARTIALLY_RETURNED", "REPLACED"] }
                    : filters.status,
                storeId: filters.store_id ? Number(filters.store_id) : undefined,
                clientId: filters.client_id ? Number(filters.client_id) : undefined,
                governorate: filters.governorate
                    ? filters.governorate
                    : undefined,
                forwardedRepo: filters.getOutComing
                    ? returnRepo?.id
                    : filters.getIncoming
                        ? undefined
                        : filters.secondaryStatus === "IN_CAR"
                            ? exportRepo?.id
                            : undefined,
            },
        });
        return results;
    };
    getOrdersStatistics = async (data) => {
        const clientID = data.loggedInUser.role === "CLIENT"
            ? data.loggedInUser.id
            : data.loggedInUser.role === "CLIENT_ASSISTANT"
                ? data.loggedInUser.clientId
                : data.filters.clientID;
        const deliveryAgentID = data.loggedInUser.role === client_1.EmployeeRole.DELIVERY_AGENT
            ? data.loggedInUser.id
            : data.filters.deliveryAgentID;
        const companyID = data.filters.companyID
            ? data.filters.companyID
            : data.loggedInUser.companyID || undefined;
        // Inquiry Employee Filters
        let inquiryStatuses = undefined;
        let inquiryGovernorates = undefined;
        let inquiryLocationsIDs = undefined;
        let inquiryBranchesIDs = undefined;
        let inquiryStoresIDs = undefined;
        let inquiryCompaniesIDs = undefined;
        let inquiryClientsIDs = undefined;
        let inquiryDeliveryAgentsIDs = undefined;
        let orderType = data.filters.orderType;
        if (data.loggedInUser.role === "INQUIRY_EMPLOYEE") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: data.loggedInUser.id,
            });
            if (inquiryEmployeeStuff) {
                orderType = inquiryEmployeeStuff.orderType || data.filters.orderType;
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
                inquiryCompaniesIDs =
                    inquiryEmployeeStuff.inquiryCompanies &&
                        inquiryEmployeeStuff.inquiryCompanies.length > 0
                        ? inquiryEmployeeStuff.inquiryCompanies
                        : undefined;
                inquiryDeliveryAgentsIDs =
                    inquiryEmployeeStuff.inquiryDeliveryAgents &&
                        inquiryEmployeeStuff.inquiryDeliveryAgents.length > 0
                        ? inquiryEmployeeStuff.inquiryDeliveryAgents
                        : undefined;
            }
        }
        if (data.loggedInUser.role === "RECEIVING_AGENT") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: data.loggedInUser.id,
            });
            inquiryClientsIDs =
                inquiryEmployeeStuff.inquiryClients &&
                    inquiryEmployeeStuff.inquiryClients.length > 0
                    ? inquiryEmployeeStuff.inquiryClients
                    : undefined;
        }
        if (data.loggedInUser.role === "CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        if (data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        // show orders/statistics without client reports to the client unless he searches for them
        let clientReport = data.filters.clientReport;
        if (data.loggedInUser.role === "CLIENT" &&
            data.filters.clientReport !== true) {
            clientReport = false;
        }
        let statistics = await ordersRepository.getOrdersStatistics({
            filters: {
                ...data.filters,
                clientID,
                deliveryAgentID,
                companyID,
                clientReport,
                inquiryStatuses,
                inquiryGovernorates,
                inquiryLocationsIDs,
                inquiryBranchesIDs,
                inquiryStoresIDs,
                inquiryCompaniesIDs,
                inquiryClientsIDs,
                inquiryDeliveryAgentsIDs,
                orderType,
            },
            loggedInUser: data.loggedInUser,
        });
        if (data.loggedInUser.role === "RECEIVING_AGENT") {
            const ordersStatisticsByStatus = await db_1.prisma.order.groupBy({
                by: ["status"],
                _sum: {
                    totalCost: true,
                },
                _count: {
                    id: true,
                },
                where: {
                    status: { in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"] },
                    clientReport: {
                        some: {
                            receivingAgentId: data.loggedInUser.id,
                            report: {
                                confirmed: false,
                                deleted: false,
                            },
                        },
                    },
                },
            });
            let total = 0;
            let count = 0;
            ordersStatisticsByStatus.map((s) => {
                total += s._sum.totalCost || 0;
                count += s._count.id;
            });
            return {
                ...statistics,
                ordersStatisticsByStatus: [
                    ...statistics.ordersStatisticsByStatus.filter((status) => status.status === "READY_TO_SEND" ||
                        status.status === "WITH_RECEIVING_AGENT"),
                    {
                        status: "RETURNED",
                        totalCost: total,
                        count: count,
                        name: "الرواجع",
                        icon: orders_responses_1.OrderStatusData["RETURNED"].icon,
                    },
                ],
            };
        }
        if (data.loggedInUser.role === "INQUIRY_EMPLOYEE") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStatuses: true,
                },
            });
            const newStatistics = statistics.ordersStatisticsByStatus.filter((status) => employee?.inquiryStatuses.includes(status.status));
            return {
                ...statistics,
                ordersStatisticsByStatus: employee?.inquiryStatuses?.length
                    ? newStatistics
                    : [],
            };
        }
        if (data.loggedInUser.role === "CLIENT_ASSISTANT" ||
            data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    orderStatus: true,
                },
            });
            const newStatistics = statistics.ordersStatisticsByStatus.filter((status) => employee?.orderStatus.includes(status.status));
            return {
                ...statistics,
                ordersStatisticsByStatus: employee?.orderStatus ? newStatistics : [],
            };
        }
        if (data.loggedInUser.role === "DELIVERY_AGENT") {
            const ordersStatisticsByStatus = statistics.ordersStatisticsByStatus.filter((status) => status.status !== "REGISTERED" &&
                status.status !== "IN_GOV_REPOSITORY" &&
                status.status !== "IN_MAIN_REPOSITORY" &&
                status.status !== "WITH_RECEIVING_AGENT" &&
                status.status !== "READY_TO_SEND");
            return {
                ...statistics,
                ordersStatisticsByStatus: ordersStatisticsByStatus,
                allOrdersStatisticsWithoutClientReport: statistics.allOrdersStatisticsWithoutDeliveryReport,
            };
        }
        if (data.loggedInUser.role === "BRANCH_MANAGER") {
            const ordersStatisticsByStatus = statistics.ordersStatisticsByStatus.filter((status) => status.status !== "REGISTERED" && status.status !== "READY_TO_SEND");
            return {
                ...statistics,
                ordersStatisticsByStatus: ordersStatisticsByStatus,
                allOrdersStatisticsWithoutClientReport: statistics.allOrdersStatisticsWithoutDeliveryReport,
            };
        }
        if (data.loggedInUser.role === "REPOSITORIY_EMPLOYEE") {
            const withReceingAgent = statistics.ordersStatisticsByStatus.find((s) => s.status === "WITH_RECEIVING_AGENT");
            const inRepo = await this.getRepositoryOrderCount({
                loggedInUser: data.loggedInUser,
                secondaryStatus: "IN_REPOSITORY",
            });
            const forwarded = await this.getRepositoryOrderCount({
                loggedInUser: data.loggedInUser,
                secondaryStatus: "IN_CAR",
            });
            const incomming = await this.getRepositoryOrderCount({
                loggedInUser: data.loggedInUser,
                repository_id: data.loggedInUser.repositoryId + "",
                secondaryStatus: "IN_CAR",
                getIncoming: "true",
            });
            return {
                ...statistics,
                ordersStatisticsByStatus: [
                    withReceingAgent,
                    {
                        status: "inrepo",
                        totalCost: 0,
                        count: inRepo,
                        name: "في المخزن",
                        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/delivered.png",
                        inside: false,
                    },
                    {
                        status: "forwarded",
                        totalCost: 0,
                        count: forwarded,
                        name: data.loggedInUser.mainRepository
                            ? "المرسله إلي الافرع"
                            : "المرسله إلي الرئيسي",
                        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/receiving.png",
                        inside: false,
                    },
                    {
                        status: "incomming",
                        totalCost: 0,
                        count: incomming,
                        name: data.loggedInUser.mainRepository
                            ? "المرسله من الافرع"
                            : "المرسله من الرئيسي",
                        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/receiving.png",
                        inside: false,
                    },
                ],
            };
        }
        if (data.loggedInUser.role === "CLIENT") {
            let newStatusStatistics = statistics.ordersStatisticsByStatus;
            let deliveredOrders = {
                status: "DELIVERED",
                count: 0,
                totalCost: 0,
                name: "تم التوصيل",
                icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/delivered.png",
                inside: true,
            };
            const pReturedOrders = newStatusStatistics.find((status) => status.status === "PARTIALLY_RETURNED");
            const deOrders = newStatusStatistics.find((status) => status.status === "DELIVERED");
            const replacedOrders = newStatusStatistics.find((status) => status.status === "REPLACED");
            deliveredOrders.count += pReturedOrders?.count
                ? pReturedOrders?.count
                : 0;
            deliveredOrders.totalCost += pReturedOrders?.totalCost
                ? pReturedOrders?.totalCost
                : 0;
            deliveredOrders.count += replacedOrders?.count
                ? replacedOrders?.count
                : 0;
            deliveredOrders.totalCost += replacedOrders?.totalCost
                ? replacedOrders?.totalCost
                : 0;
            deliveredOrders.count += deOrders?.count ? deOrders?.count : 0;
            deliveredOrders.totalCost += deOrders?.totalCost
                ? deOrders?.totalCost
                : 0;
            let reg = newStatusStatistics.find((status) => status.status === "REGISTERED");
            let ready = newStatusStatistics.find((status) => status.status === "READY_TO_SEND");
            let withR = newStatusStatistics.find((status) => status.status === "WITH_RECEIVING_AGENT");
            let inGov = newStatusStatistics.find((status) => status.status === "IN_GOV_REPOSITORY");
            let inMain = newStatusStatistics.find((status) => status.status === "IN_MAIN_REPOSITORY");
            let rCount = 0, rTotal = 0, dCount = 0, dtotal = 0;
            rCount += reg?.count ? reg.count : 0;
            rCount += ready?.count ? ready.count : 0;
            rTotal += reg?.totalCost ? reg.totalCost : 0;
            rTotal += ready?.totalCost ? ready.totalCost : 0;
            dCount += withR?.count ? withR.count : 0;
            dCount += inGov?.count ? inGov.count : 0;
            dCount += inMain?.count ? inMain.count : 0;
            dtotal += withR?.totalCost ? withR.totalCost : 0;
            dtotal += inGov?.totalCost ? inGov.totalCost : 0;
            dtotal += inMain?.totalCost ? inMain.totalCost : 0;
            let updatedStatusStatistics = newStatusStatistics.filter((status) => status.status !== "REGISTERED" &&
                status.status !== "READY_TO_SEND" &&
                status.status !== "WITH_RECEIVING_AGENT" &&
                status.status !== "DELIVERED" &&
                status.status !== "PARTIALLY_RETURNED" &&
                status.status !== "REPLACED" &&
                status.status !== "IN_GOV_REPOSITORY" &&
                status.status !== "IN_MAIN_REPOSITORY");
            updatedStatusStatistics.unshift(deliveredOrders);
            updatedStatusStatistics.unshift({
                name: "قيد التوصيل",
                status: "WITH_RECEIVING_AGENT",
                icon: newStatusStatistics.find((status) => status.status === "WITH_RECEIVING_AGENT")?.icon || "",
                count: dCount,
                totalCost: dtotal,
                inside: true,
            });
            updatedStatusStatistics.unshift({
                name: "قيد الارسال",
                status: "REGISTERED",
                icon: newStatusStatistics.find((status) => status.status === "REGISTERED")
                    ?.icon || "",
                count: rCount,
                totalCost: rTotal,
                inside: true,
            });
            return {
                ...statistics,
                ordersStatisticsByStatus: updatedStatusStatistics,
            };
        }
        return statistics;
    };
    getOrdersStatisticV2 = async (data) => {
        const clientID = data.loggedInUser.role === "CLIENT"
            ? data.loggedInUser.id
            : data.loggedInUser.role === "CLIENT_ASSISTANT"
                ? data.loggedInUser.clientId
                : data.filters.clientID;
        const deliveryAgentID = data.loggedInUser.role === client_1.EmployeeRole.DELIVERY_AGENT
            ? data.loggedInUser.id
            : data.filters.deliveryAgentID;
        const companyID = data.filters.companyID
            ? data.filters.companyID
            : data.loggedInUser.companyID || undefined;
        // Inquiry Employee Filters
        let inquiryStatuses = undefined;
        let inquiryGovernorates = undefined;
        let inquiryLocationsIDs = undefined;
        let inquiryBranchesIDs = undefined;
        let inquiryStoresIDs = undefined;
        let inquiryCompaniesIDs = undefined;
        let inquiryClientsIDs = undefined;
        let inquiryDeliveryAgentsIDs = undefined;
        let orderType = data.filters.orderType;
        if (data.loggedInUser.role === "INQUIRY_EMPLOYEE") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: data.loggedInUser.id,
            });
            if (inquiryEmployeeStuff) {
                orderType = inquiryEmployeeStuff.orderType || data.filters.orderType;
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
                inquiryCompaniesIDs =
                    inquiryEmployeeStuff.inquiryCompanies &&
                        inquiryEmployeeStuff.inquiryCompanies.length > 0
                        ? inquiryEmployeeStuff.inquiryCompanies
                        : undefined;
                inquiryDeliveryAgentsIDs =
                    inquiryEmployeeStuff.inquiryDeliveryAgents &&
                        inquiryEmployeeStuff.inquiryDeliveryAgents.length > 0
                        ? inquiryEmployeeStuff.inquiryDeliveryAgents
                        : undefined;
            }
        }
        if (data.loggedInUser.role === "RECEIVING_AGENT") {
            const inquiryEmployeeStuff = await employeesRepository.getInquiryEmployeeStuff({
                employeeID: data.loggedInUser.id,
            });
            inquiryClientsIDs =
                inquiryEmployeeStuff.inquiryClients &&
                    inquiryEmployeeStuff.inquiryClients.length > 0
                    ? inquiryEmployeeStuff.inquiryClients
                    : undefined;
        }
        if (data.loggedInUser.role === "CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        if (data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStores: true,
                },
            });
            inquiryStoresIDs = employee?.inquiryStores.map((s) => s.storeId);
        }
        // show orders/statistics without client reports to the client unless he searches for them
        let clientReport = data.filters.clientReport;
        if (data.loggedInUser.role === "CLIENT" &&
            data.filters.clientReport !== true) {
            clientReport = false;
        }
        let statistics = await ordersRepository.getOrdersStatistics({
            filters: {
                ...data.filters,
                clientID,
                deliveryAgentID,
                companyID,
                clientReport,
                inquiryStatuses,
                inquiryGovernorates,
                inquiryLocationsIDs,
                inquiryBranchesIDs,
                inquiryStoresIDs,
                inquiryCompaniesIDs,
                inquiryClientsIDs,
                inquiryDeliveryAgentsIDs,
                orderType,
            },
            loggedInUser: data.loggedInUser,
        });
        if (data.loggedInUser.role === "RECEIVING_AGENT") {
            const ordersStatisticsByStatus = await db_1.prisma.order.groupBy({
                by: ["status"],
                _sum: {
                    totalCost: true,
                },
                _count: {
                    id: true,
                },
                where: {
                    status: { in: ["RETURNED", "REPLACED", "PARTIALLY_RETURNED"] },
                    clientReport: {
                        some: {
                            receivingAgentId: data.loggedInUser.id,
                            report: {
                                confirmed: false,
                                deleted: false,
                            },
                        },
                    },
                },
            });
            let total = 0;
            let count = 0;
            ordersStatisticsByStatus.map((s) => {
                total += s._sum.totalCost || 0;
                count += s._count.id;
            });
            return {
                ...statistics,
                ordersStatisticsByStatus: [
                    ...statistics.ordersStatisticsByStatus.filter((status) => status.status === "READY_TO_SEND" ||
                        status.status === "WITH_RECEIVING_AGENT"),
                    {
                        status: "RETURNED",
                        totalCost: total,
                        count: count,
                        name: "الرواجع",
                        icon: orders_responses_1.OrderStatusData["RETURNED"].icon,
                    },
                ],
            };
        }
        if (data.loggedInUser.role === "INQUIRY_EMPLOYEE") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    inquiryStatuses: true,
                },
            });
            const newStatistics = statistics.ordersStatisticsByStatus.filter((status) => employee?.inquiryStatuses.includes(status.status));
            return {
                ...statistics,
                ordersStatisticsByStatus: employee?.inquiryStatuses?.length
                    ? newStatistics
                    : [],
            };
        }
        if (data.loggedInUser.role === "CLIENT_ASSISTANT" ||
            data.loggedInUser.role === "EMPLOYEE_CLIENT_ASSISTANT") {
            const employee = await db_1.prisma.employee.findUnique({
                where: {
                    id: data.loggedInUser.id,
                },
                select: {
                    orderStatus: true,
                    inquiryStores: true,
                },
            });
            const readyToPrint = await db_1.prisma.order.count({
                where: {
                    storeId: { in: employee?.inquiryStores.map((s) => s.storeId) },
                    status: "REGISTERED",
                    printed: false,
                    deleted: false,
                },
            });
            const readyToShip = await db_1.prisma.order.count({
                where: {
                    storeId: { in: employee?.inquiryStores.map((s) => s.storeId) },
                    status: "REGISTERED",
                    printed: true,
                    deleted: false,
                },
            });
            const newStatistics = statistics.ordersStatisticsByStatus.filter((status) => employee?.orderStatus.includes(status.status));
            return {
                ...statistics,
                ordersStatisticsByStatus: employee?.orderStatus ? newStatistics : [],
                readyToPrint,
                readyToShip,
            };
        }
        if (data.loggedInUser.role === "DELIVERY_AGENT") {
            const ordersStatisticsByStatus = statistics.ordersStatisticsByStatus.filter((status) => status.status !== "REGISTERED" &&
                status.status !== "IN_GOV_REPOSITORY" &&
                status.status !== "IN_MAIN_REPOSITORY" &&
                status.status !== "WITH_RECEIVING_AGENT" &&
                status.status !== "READY_TO_SEND");
            return {
                ...statistics,
                ordersStatisticsByStatus: ordersStatisticsByStatus,
                allOrdersStatisticsWithoutClientReport: statistics.allOrdersStatisticsWithoutDeliveryReport,
            };
        }
        if (data.loggedInUser.role === "BRANCH_MANAGER") {
            const ordersStatisticsByStatus = statistics.ordersStatisticsByStatus.filter((status) => status.status !== "REGISTERED" && status.status !== "READY_TO_SEND");
            return {
                ...statistics,
                ordersStatisticsByStatus: ordersStatisticsByStatus,
                allOrdersStatisticsWithoutClientReport: statistics.allOrdersStatisticsWithoutDeliveryReport,
            };
        }
        if (data.loggedInUser.role === "REPOSITORIY_EMPLOYEE") {
            const withReceingAgent = statistics.ordersStatisticsByStatus.find((s) => s.status === "WITH_RECEIVING_AGENT");
            const inRepo = await this.getRepositoryOrderCount({
                loggedInUser: data.loggedInUser,
                secondaryStatus: "IN_REPOSITORY",
            });
            const forwarded = await this.getRepositoryOrderCount({
                loggedInUser: data.loggedInUser,
                secondaryStatus: "IN_CAR",
            });
            const incomming = await this.getRepositoryOrderCount({
                loggedInUser: data.loggedInUser,
                repository_id: data.loggedInUser.repositoryId + "",
                secondaryStatus: "IN_CAR",
                getIncoming: "true",
            });
            return {
                ...statistics,
                ordersStatisticsByStatus: [
                    withReceingAgent,
                    {
                        status: "inrepo",
                        totalCost: 0,
                        count: inRepo,
                        name: "في المخزن",
                        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/delivered.png",
                        inside: false,
                    },
                    {
                        status: "forwarded",
                        totalCost: 0,
                        count: forwarded,
                        name: data.loggedInUser.mainRepository
                            ? "المرسله إلي الافرع"
                            : "المرسله إلي الرئيسي",
                        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/receiving.png",
                        inside: false,
                    },
                    {
                        status: "incomming",
                        totalCost: 0,
                        count: incomming,
                        name: data.loggedInUser.mainRepository
                            ? "المرسله من الافرع"
                            : "المرسله من الرئيسي",
                        icon: "https://albarq-bucket.fra1.digitaloceanspaces.com/icons/receiving.png",
                        inside: false,
                    },
                ],
            };
        }
        if (data.loggedInUser.role === "CLIENT") {
            const readyToPrint = await db_1.prisma.order.count({
                where: {
                    clientId: data.loggedInUser.id,
                    status: "REGISTERED",
                    printed: false,
                    deleted: false,
                },
            });
            const readyToShip = await db_1.prisma.order.count({
                where: {
                    clientId: data.loggedInUser.id,
                    status: "REGISTERED",
                    printed: true,
                    deleted: false,
                },
            });
            return { ...statistics, readyToPrint, readyToShip };
        }
        return statistics;
    };
    getOrderTimeline = async (data) => {
        const orderTimeline = await ordersRepository.getOrderTimeline({
            params: data.params,
            filters: data.filters,
        });
        return orderTimeline;
    };
    getOrderTimelineApiKey = async (data) => {
        const orderTimeline = await ordersRepository.getOrderTimelineApiKey({
            params: data.params,
        });
        return orderTimeline;
    };
    getOrderChatMembers = async (data) => {
        const orderChatMembers = await ordersRepository.getOrderChatMembers({
            orderID: data.params.orderID,
        });
        return orderChatMembers;
    };
    getOrderInquiryEmployees = async (data) => {
        const orderInquiryEmployees = await ordersRepository.getOrderInquiryEmployees({
            orderID: data.params.orderID,
        });
        return orderInquiryEmployees;
    };
    deactivateOrder = async (data) => {
        if (data.loggedInUser.role === "CLIENT" ||
            data.loggedInUser.role === "CLIENT_ASSISTANT") {
            const order = await ordersRepository.getOrderStatus({
                orderID: data.params.orderID,
            });
            if (order?.status !== client_1.OrderStatus.REGISTERED &&
                order?.status !== client_1.OrderStatus.READY_TO_SEND) {
                throw new AppError_1.AppError("لا يمكن حذف الطلب", 403);
            }
        }
        await ordersRepository.deactivateOrder({
            orderID: data.params.orderID,
            deletedByID: data.loggedInUser.id,
        });
    };
    reactivateOrder = async (data) => {
        await ordersRepository.reactivateOrder({
            orderID: data.params.orderID,
        });
    };
    sendNotificationToOrderChatMembers = async (data) => {
        const orderChatMembers = await ordersRepository.getOrderChatMembers({
            orderID: data.params.orderID,
        });
        const notificationPromises = orderChatMembers.map((member) => {
            if (!member) {
                return Promise.resolve();
            }
            if (member.id === data.loggedInUser.id) {
                return Promise.resolve();
            }
            return (0, sendNotification_1.sendNotification)({
                userID: member.id,
                title: data.notificationData.title,
                content: data.notificationData.content ||
                    `تم إرسال رسالة جديدة في الطلب رقم ${data.params.orderID} من قبل ${data.loggedInUser.name}`,
            });
        });
        await Promise.all(notificationPromises);
    };
}
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map