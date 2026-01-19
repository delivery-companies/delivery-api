"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { ClientRole } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
const client_1 = require("@prisma/client");
const express_1 = require("express");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const orders_controller_1 = require("./orders.controller");
const preventDuplicateRequests_1 = require("../../middlewares/preventDuplicateRequests");
const multer_1 = __importDefault(require("multer"));
const isApiClient_1 = require("../../middlewares/isApiClient");
const upload = (0, multer_1.default)();
const router = (0, express_1.Router)();
const ordersController = new orders_controller_1.OrdersController();
router.post("/orders/update-from-csv", ordersController.updateOrderCsv);
router
    .route("/orders")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
], [client_1.Permission.ADD_ORDER]), preventDuplicateRequests_1.preventDuplicateRequests, ordersController.createOrder);
router
    .route("/orders/create")
    .post(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
], [client_1.Permission.ADD_ORDER]), preventDuplicateRequests_1.preventDuplicateRequests, ordersController.createOrder);
router.route("/orders").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getAllOrders
/*
      #swagger.tags = ['Orders Routes']

      #swagger.parameters['page'] = {
          in: 'query',
          description: 'Page Number',
          required: false
      }

      #swagger.parameters['size'] = {
          in: 'query',
          description: 'Page Size (Number of Items per Page) (Default: 10)',
          required: false
      }

      #swagger.parameters['search'] = {
          in: 'query',
          description: 'Search Query',
          required: false
      }

      #swagger.parameters['sort'] = {
          in: 'query',
          description: 'Sort Query (Default: id:asc)',
          required: false
      }

      #swagger.parameters['start_date'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['end_date'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['delivery_date'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['governorate'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['statuses'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['delivery_type'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['delivery_agent_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['client_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['store_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['product_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['location_id'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['receipt_number'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['recipient_name'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['recipient_phone'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['recipient_address'] = {
          in: 'query',
          description: '',
          required: false
      }

      #swagger.parameters['notes'] = {
          in: 'query',
          description: '',
          required: false
      }
  */
);
router
    .route("/orders/getAll")
    .get(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getAllOrdersApiKey);
router.route("/getGeneralInfo").get(ordersController.getGeneralInfo);
router.route("/orders/statistics").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrdersStatistics);
router.route("/orders/v2/statistics").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrdersStatisticsV2);
router.route("/orders/clientStatistics").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getCLientOrdersStatistics);
router.route("/orders/statusStatistics").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getStatusOrdersStatistics);
router.route("/orders/repositoryStatusStatistics").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getRepositorOrdersStatistics);
router.route("/orders/returnedRepositoryStatusStatistics").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getReturnedRepositorOrdersStatistics);
router.route("/orders/repositoryOrders").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.REPOSITORIY_EMPLOYEE,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    // TODO: Remove later
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getRepositoryOrders);
router
    .route("/orders/getOrdersSheet")
    .get(isLoggedIn_1.isLoggedIn, ordersController.generateExcelSheet);
router.route("/orders/pdf").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrdersReportPDF
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/repository-orders/pdf").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getRepositoryOrdersPDF
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/getByStore").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getReceivingAgentStores
/*
      #swagger.tags = ['Orders Routes']
  */
);
router
    .route("/orders/pdf/getAll")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getPdfs);
router.route("/orders/getById/:orderID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderById
/*
      #swagger.tags = ['Orders Routes']
  */
);
router
    .route("/orders/getOne/:orderID")
    .get(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderByIdApiKey);
router
    .route("/orders/pdf/:id")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderPdf);
router.route("/orders/:orderID").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrder
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/timeline").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderTimeline
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/orderTimeline").get(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderTimelineApiKey
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/chat-members").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderChatMembers
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/inquiry-employees").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.getOrderInquiryEmployees
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/chat").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.sendNotificationToOrderChatMembers
/*
      #swagger.tags = ['Orders Routes']
  */
);
router
    .route("/orders/receipts")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.createOrdersReceipts);
router
    .route("/orders/receiptsPdf")
    .post(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.createOrdersReceipts);
router.route("/orders/:orderID").patch(upload.none(), // Handles form-data without files
isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
], [
    client_1.Permission.CHANGE_CLOSED_ORDER_STATUS,
    client_1.Permission.CHANGE_ORDER_BRANCH,
    client_1.Permission.CHANGE_ORDER_CLIENT,
    client_1.Permission.CHANGE_ORDER_COMPANY,
    client_1.Permission.CHANGE_ORDER_DELIVERY_AGENT,
    client_1.Permission.CHANGE_ORDER_STATUS,
    client_1.Permission.CHANGE_ORDER_TOTAL_AMOUNT,
    client_1.Permission.LOCK_ORDER_STATUS,
    client_1.Permission.CHANGE_ORDER_DATA,
    client_1.Permission.CHANGE_ORDER_PAID_AMOUNT,
    client_1.Permission.CHANGE_ORDER_RECEIPT_NUMBER,
    client_1.Permission.CHANGE_ORDER_RECEPIENT_NUMBER,
]), ordersController.updateOrder);
router
    .route("/orders/sendOrders")
    .post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
], [
    client_1.Permission.CHANGE_CLOSED_ORDER_STATUS,
    client_1.Permission.CHANGE_ORDER_BRANCH,
    client_1.Permission.CHANGE_ORDER_CLIENT,
    client_1.Permission.CHANGE_ORDER_COMPANY,
    client_1.Permission.CHANGE_ORDER_DELIVERY_AGENT,
    client_1.Permission.CHANGE_ORDER_STATUS,
    client_1.Permission.CHANGE_ORDER_TOTAL_AMOUNT,
    client_1.Permission.LOCK_ORDER_STATUS,
    client_1.Permission.CHANGE_ORDER_DATA,
    client_1.Permission.CHANGE_ORDER_PAID_AMOUNT,
    client_1.Permission.CHANGE_ORDER_RECEIPT_NUMBER,
    client_1.Permission.CHANGE_ORDER_RECEPIENT_NUMBER,
    client_1.Permission.SEND_ORDER,
]), ordersController.sendOrdersToReceivingAgent);
router
    .route("/orders/sendOrderToShipped")
    .post(isApiClient_1.isApiClient, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
], []), ordersController.sendOrdersToReceivingAgentApiKey);
//  تأكيد مباشر برقم الطل في صفحة ادخال الطلبات المخزن
router.route("/orders/addOrderToRepository/:orderID").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.addOrderToRepository
/*
      #swagger.tags = ['Orders Routes']
  */
);
router
    .route("/orders/repository-confirm-order-by-receipt-number/:orderID")
    .patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    ...Object.values(client_1.AdminRole),
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), ordersController.addReturnedOrderToRepository
/*
    #swagger.tags = ['Orders Routes']
*/
);
router.route("/orders/:orderID").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), ordersController.deleteOrder
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/deactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    client_1.ClientRole.CLIENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
], [client_1.Permission.DELETE_ORDER]), ordersController.deactivateOrder
/*
      #swagger.tags = ['Orders Routes']
  */
);
router.route("/orders/:orderID/reactivate").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), ordersController.reactivateOrder
/*
      #swagger.tags = ['Orders Routes']
  */
);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map