import { Router } from "express";

import {  ClientRole, EmployeeRole } from "@prisma/client";
import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";
import { TicketController } from "./tickets.controller";
const router = Router();
const ticketController = new TicketController();

router.route("/ticket").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.createTicket
);

router.route("/ticket").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.getAllTicket
);

router.route("/ticket/:id").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.closeTicket
);

router.route("/ticket/:id").get(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.getOne
);

router.route("/take-ticket/:id").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.takeTicket
);

router.route("/forward-ticket/:id").patch(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.forwardTicket
);


router.route("/ticket-response").post(
    isLoggedIn,
    isAutherized([EmployeeRole.COMPANY_MANAGER,
        EmployeeRole.BRANCH_MANAGER,
        EmployeeRole.ACCOUNT_MANAGER,
        EmployeeRole.DATA_ENTRY,
        EmployeeRole.INQUIRY_EMPLOYEE,
        EmployeeRole.DELIVERY_AGENT,
        EmployeeRole.CLIENT_ASSISTANT,
        ClientRole.CLIENT
    ]),
    ticketController.createResponse
);

export default router