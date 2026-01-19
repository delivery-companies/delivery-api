"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const transactions_controller_1 = require("./transactions.controller");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
const transactionsController = new transactions_controller_1.TransactionsController();
/**
 * @route POST /transactions
 * @desc Create a new transaction
 */
router.route("/transactions").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.AdminRole.ADMIN,
]), upload_1.upload.none(), transactionsController.createTransaction
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
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), transactionsController.getAllTransactions);
router
    .route("/receivingAgent-clients")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), transactionsController.getReceivingAgent);
router
    .route("/transactions/getWallets")
    .get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
    ...Object.values(client_1.EmployeeRole),
    ...Object.values(client_1.ClientRole),
]), transactionsController.getEmployeesWallet);
/**
 * @route GET /transactions/:transactionId
 * @desc Get single transaction by ID
 */
router.route("/transactions/:transactionId").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), transactionsController.getTransaction
/*
    #swagger.tags = ['Transactions Routes']
*/
);
/**
 * @route PATCH /transactions/:transactionId
 * @desc Update a transaction by ID
 */
router.route("/transactions/:transactionId").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), transactionsController.updateTransaction
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
router.route("/transactions/:transactionId").delete(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([
    client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.ACCOUNTANT,
    client_1.AdminRole.ADMIN,
    client_1.AdminRole.ADMIN_ASSISTANT,
]), transactionsController.deleteTransaction
/*
    #swagger.tags = ['Transactions Routes']
*/
);
exports.default = router;
//# sourceMappingURL=transactions.routes.js.map