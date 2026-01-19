// import { ClientRole } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import {AdminRole, ClientRole, EmployeeRole, Permission} from "@prisma/client";
import {Router} from "express";
import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {OrdersController} from "./orders.controller";
import {preventDuplicateRequests} from "../../middlewares/preventDuplicateRequests";

import multer from "multer";
import {isApiClient} from "../../middlewares/isApiClient";
const upload = multer();
const router = Router();
const ordersController = new OrdersController();

router.post("/orders/update-from-csv", ordersController.updateOrderCsv);

router
  .route("/orders")
  .post(
    isLoggedIn,
    isAutherized(
      [
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.ACCOUNTANT,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT,
      ],
      [Permission.ADD_ORDER]
    ),
    preventDuplicateRequests,
    ordersController.createOrder
  );

router
  .route("/orders/create")
  .post(
    isApiClient,
    isAutherized(
      [
        EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.ACCOUNTANT,
        ClientRole.CLIENT,
        EmployeeRole.CLIENT_ASSISTANT,
      ],
      [Permission.ADD_ORDER]
    ),
    preventDuplicateRequests,
    ordersController.createOrder
  );

router.route("/orders").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getAllOrders
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
  .get(
    isApiClient,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.getAllOrdersApiKey
  );

router.route("/getGeneralInfo").get(ordersController.getGeneralInfo);

router.route("/orders/statistics").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    ClientRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrdersStatistics
);

router.route("/orders/v2/statistics").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    ClientRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrdersStatisticsV2
);

router.route("/orders/clientStatistics").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    ClientRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getCLientOrdersStatistics
);

router.route("/orders/statusStatistics").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    ClientRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getStatusOrdersStatistics
);
router.route("/orders/repositoryStatusStatistics").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    ClientRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getRepositorOrdersStatistics
);

router.route("/orders/returnedRepositoryStatusStatistics").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    ClientRole.CLIENT,
    EmployeeRole.CLIENT_ASSISTANT,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getReturnedRepositorOrdersStatistics
);
router.route("/orders/repositoryOrders").get(
  isLoggedIn,
  isAutherized([
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
    EmployeeRole.COMPANY_MANAGER,
    EmployeeRole.REPOSITORIY_EMPLOYEE,
    EmployeeRole.BRANCH_MANAGER,
    EmployeeRole.ACCOUNT_MANAGER,
    // TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getRepositoryOrders
);

router
  .route("/orders/getOrdersSheet")
  .get(isLoggedIn, ordersController.generateExcelSheet);

router.route("/orders/pdf").post(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrdersReportPDF
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/repository-orders/pdf").post(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getRepositoryOrdersPDF
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/getByStore").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getReceivingAgentStores
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router
  .route("/orders/pdf/getAll")
  .get(
    isLoggedIn,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.getPdfs
  );

router.route("/orders/getById/:orderID").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrderById
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router
  .route("/orders/getOne/:orderID")
  .get(
    isApiClient,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.getOrderByIdApiKey
  );

router
  .route("/orders/pdf/:id")
  .get(
    isLoggedIn,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.getOrderPdf
  );

router.route("/orders/:orderID").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrder
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/timeline").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrderTimeline
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/orderTimeline").get(
  isApiClient,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrderTimelineApiKey
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/chat-members").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrderChatMembers
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/inquiry-employees").get(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.getOrderInquiryEmployees
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/chat").post(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.sendNotificationToOrderChatMembers
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router
  .route("/orders/receipts")
  .post(
    isLoggedIn,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.createOrdersReceipts
  );

router
  .route("/orders/receiptsPdf")
  .post(
    isApiClient,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.createOrdersReceipts
  );

router.route("/orders/:orderID").patch(
  upload.none(), // Handles form-data without files
  isLoggedIn,
  isAutherized(
    [
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ],
    [
      Permission.CHANGE_CLOSED_ORDER_STATUS,
      Permission.CHANGE_ORDER_BRANCH,
      Permission.CHANGE_ORDER_CLIENT,
      Permission.CHANGE_ORDER_COMPANY,
      Permission.CHANGE_ORDER_DELIVERY_AGENT,
      Permission.CHANGE_ORDER_STATUS,
      Permission.CHANGE_ORDER_TOTAL_AMOUNT,
      Permission.LOCK_ORDER_STATUS,
      Permission.CHANGE_ORDER_DATA,
      Permission.CHANGE_ORDER_PAID_AMOUNT,
      Permission.CHANGE_ORDER_RECEIPT_NUMBER,
      Permission.CHANGE_ORDER_RECEPIENT_NUMBER,
    ]
  ),
  ordersController.updateOrder
);

router
  .route("/orders/sendOrders")
  .post(
    isLoggedIn,
    isAutherized(
      [
        ...Object.values(AdminRole),
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole),
      ],
      [
        Permission.CHANGE_CLOSED_ORDER_STATUS,
        Permission.CHANGE_ORDER_BRANCH,
        Permission.CHANGE_ORDER_CLIENT,
        Permission.CHANGE_ORDER_COMPANY,
        Permission.CHANGE_ORDER_DELIVERY_AGENT,
        Permission.CHANGE_ORDER_STATUS,
        Permission.CHANGE_ORDER_TOTAL_AMOUNT,
        Permission.LOCK_ORDER_STATUS,
        Permission.CHANGE_ORDER_DATA,
        Permission.CHANGE_ORDER_PAID_AMOUNT,
        Permission.CHANGE_ORDER_RECEIPT_NUMBER,
        Permission.CHANGE_ORDER_RECEPIENT_NUMBER,
        Permission.SEND_ORDER,
      ]
    ),
    ordersController.sendOrdersToReceivingAgent
  );

router
  .route("/orders/sendOrderToShipped")
  .post(
    isApiClient,
    isAutherized(
      [
        ...Object.values(AdminRole),
        ...Object.values(EmployeeRole),
        ...Object.values(ClientRole),
      ],
      []
    ),
    ordersController.sendOrdersToReceivingAgentApiKey
  );

//  تأكيد مباشر برقم الطل في صفحة ادخال الطلبات المخزن
router.route("/orders/addOrderToRepository/:orderID").patch(
  isLoggedIn,
  isAutherized([
    ...Object.values(AdminRole),
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  ordersController.addOrderToRepository
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router
  .route("/orders/repository-confirm-order-by-receipt-number/:orderID")
  .patch(
    isLoggedIn,
    isAutherized([
      ...Object.values(AdminRole),
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    ordersController.addReturnedOrderToRepository
    /*
        #swagger.tags = ['Orders Routes']
    */
  );
router.route("/orders/:orderID").delete(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  ordersController.deleteOrder
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/deactivate").patch(
  isLoggedIn,
  isAutherized(
    [
      EmployeeRole.COMPANY_MANAGER,
      AdminRole.ADMIN,
      AdminRole.ADMIN_ASSISTANT,
      ClientRole.CLIENT,
      EmployeeRole.CLIENT_ASSISTANT,
    ],
    [Permission.DELETE_ORDER]
  ),
  ordersController.deactivateOrder
  /*
        #swagger.tags = ['Orders Routes']
    */
);

router.route("/orders/:orderID/reactivate").patch(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  ordersController.reactivateOrder
  /*
        #swagger.tags = ['Orders Routes']
    */
);

export default router;
