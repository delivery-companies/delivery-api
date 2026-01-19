import {Router} from "express";
import {AdminRole, ClientRole, EmployeeRole} from "@prisma/client";
import {isAutherized} from "../../middlewares/isAutherized";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {TransactionsController} from "./transactions.controller";
import {upload} from "../../middlewares/upload";

const router = Router();
const transactionsController = new TransactionsController();

/**
 * @route POST /transactions
 * @desc Create a new transaction
 */
router.route("/transactions").post(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    EmployeeRole.BRANCH_MANAGER,
    EmployeeRole.ACCOUNTANT,
    AdminRole.ADMIN,
  ]),
  upload.none(),

  transactionsController.createTransaction
  /*
      #swagger.tags = ['Transactions Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/TransactionCreateSchema" },
                  examples: {
                      TransactionCreateExample: { $ref: "#/components/examples/TransactionCreateExample" }
                  }
              }
          }
      }
  */
);

/**
 * @route GET /transactions
 * @desc Get all transactions (paginated)
 */
router
  .route("/transactions")
  .get(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.ACCOUNTANT,
      AdminRole.ADMIN,
      AdminRole.ADMIN_ASSISTANT,
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    transactionsController.getAllTransactions
  );

router
  .route("/receivingAgent-clients")
  .get(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.ACCOUNTANT,
      AdminRole.ADMIN,
      AdminRole.ADMIN_ASSISTANT,
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    transactionsController.getReceivingAgent
  );

router
  .route("/transactions/getWallets")
  .get(
    isLoggedIn,
    isAutherized([
      EmployeeRole.COMPANY_MANAGER,
      EmployeeRole.ACCOUNTANT,
      AdminRole.ADMIN,
      AdminRole.ADMIN_ASSISTANT,
      ...Object.values(EmployeeRole),
      ...Object.values(ClientRole),
    ]),
    transactionsController.getEmployeesWallet
  );
/**
 * @route GET /transactions/:transactionId
 * @desc Get single transaction by ID
 */
router.route("/transactions/:transactionId").get(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  transactionsController.getTransaction
  /*
      #swagger.tags = ['Transactions Routes']
  */
);

/**
 * @route PATCH /transactions/:transactionId
 * @desc Update a transaction by ID
 */
router.route("/transactions/:transactionId").patch(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    EmployeeRole.ACCOUNTANT,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  transactionsController.updateTransaction
  /*
      #swagger.tags = ['Transactions Routes']

      #swagger.requestBody = {
          required: true,
          content: {
              "application/json": {
                  schema: { $ref: "#/components/schemas/TransactionUpdateSchema" },
                  examples: {
                      TransactionUpdateExample: { $ref: "#/components/examples/TransactionUpdateExample" }
                  }
              }
          }
      }
  */
);

/**
 * @route DELETE /transactions/:transactionId
 * @desc Delete a transaction
 */
router.route("/transactions/:transactionId").delete(
  isLoggedIn,
  isAutherized([
    EmployeeRole.COMPANY_MANAGER,
    EmployeeRole.ACCOUNTANT,
    AdminRole.ADMIN,
    AdminRole.ADMIN_ASSISTANT,
  ]),
  transactionsController.deleteTransaction
  /*
      #swagger.tags = ['Transactions Routes']
  */
);

export default router;
