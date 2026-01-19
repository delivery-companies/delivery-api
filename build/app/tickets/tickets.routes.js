"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const isAutherized_1 = require("../../middlewares/isAutherized");
const isLoggedIn_1 = require("../../middlewares/isLoggedIn");
const tickets_controller_1 = require("./tickets.controller");
const router = (0, express_1.Router)();
const ticketController = new tickets_controller_1.TicketController();
router.route("/ticket").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.createTicket);
router.route("/ticket").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.getAllTicket);
router.route("/ticket/:id").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.closeTicket);
router.route("/ticket/:id").get(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.getOne);
router.route("/take-ticket/:id").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.takeTicket);
router.route("/forward-ticket/:id").patch(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.forwardTicket);
router.route("/ticket-response").post(isLoggedIn_1.isLoggedIn, (0, isAutherized_1.isAutherized)([client_1.EmployeeRole.COMPANY_MANAGER,
    client_1.EmployeeRole.BRANCH_MANAGER,
    client_1.EmployeeRole.ACCOUNT_MANAGER,
    client_1.EmployeeRole.DATA_ENTRY,
    client_1.EmployeeRole.INQUIRY_EMPLOYEE,
    client_1.EmployeeRole.DELIVERY_AGENT,
    client_1.EmployeeRole.CLIENT_ASSISTANT,
    client_1.ClientRole.CLIENT
]), ticketController.createResponse);
exports.default = router;
//# sourceMappingURL=tickets.routes.js.map