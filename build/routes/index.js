"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../app/auth/auth.routes"));
const automaticUpdates_routes_1 = __importDefault(require("../app/automatic-updates/automaticUpdates.routes"));
const banners_routes_1 = __importDefault(require("../app/banners/banners.routes"));
const branches_routes_1 = __importDefault(require("../app/branches/branches.routes"));
const categories_routes_1 = __importDefault(require("../app/categories/categories.routes"));
const clients_routes_1 = __importDefault(require("../app/clients/clients.routes"));
const colors_routes_1 = __importDefault(require("../app/colors/colors.routes"));
const companies_routes_1 = __importDefault(require("../app/companies/companies.routes"));
const employees_routes_1 = __importDefault(require("../app/employees/employees.routes"));
const locations_routes_1 = __importDefault(require("../app/locations/locations.routes"));
const notifications_routes_1 = __importDefault(require("../app/notifications/notifications.routes"));
const orders_routes_1 = __importDefault(require("../app/orders/orders.routes"));
const products_routes_1 = __importDefault(require("../app/products/products.routes"));
const reports_routes_1 = __importDefault(require("../app/reports/reports.routes"));
const repositories_routes_1 = __importDefault(require("../app/repositories/repositories.routes"));
const sizes_routes_1 = __importDefault(require("../app/sizes/sizes.routes"));
const stores_routes_1 = __importDefault(require("../app/stores/stores.routes"));
const users_routes_1 = __importDefault(require("../app/users/users.routes"));
const closedStatus_routes_1 = __importDefault(require("../app/ClosedStatus/closedStatus.routes"));
const clientReceipts_routes_1 = __importDefault(require("../app/clientReceipts/clientReceipts.routes"));
const customerOutput_routes_1 = __importDefault(require("../app/customerOutputs/customerOutput.routes"));
const deparment_routes_1 = __importDefault(require("../app/departments/deparment.routes"));
const tickets_routes_1 = __importDefault(require("../app/tickets/tickets.routes"));
const messages_routes_1 = __importDefault(require("../app/messages/messages.routes"));
const transactions_routes_1 = __importDefault(require("../app/transactions/transactions.routes"));
const catchAsync_1 = require("../lib/catchAsync");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.use("/", auth_routes_1.default);
router.use("/", employees_routes_1.default);
router.use("/", repositories_routes_1.default);
router.use("/", clients_routes_1.default);
router.use("/", branches_routes_1.default);
router.use("/", locations_routes_1.default);
router.use("/", companies_routes_1.default);
router.use("/", orders_routes_1.default);
router.use("/", products_routes_1.default);
router.use("/", categories_routes_1.default);
router.use("/", notifications_routes_1.default);
router.use("/", colors_routes_1.default);
router.use("/", sizes_routes_1.default);
router.use("/", stores_routes_1.default);
router.use("/", banners_routes_1.default);
router.use("/", reports_routes_1.default);
router.use("/", automaticUpdates_routes_1.default);
router.use("/", users_routes_1.default);
router.use("/", clientReceipts_routes_1.default);
router.use("/", customerOutput_routes_1.default);
router.use("/", deparment_routes_1.default);
router.use("/", tickets_routes_1.default);
router.use("/", messages_routes_1.default);
router.use("/", closedStatus_routes_1.default);
router.use("/", transactions_routes_1.default);
/*******************************************************************************
 * TEST ROUTES
 * TODO: Remove these routes
 *******************************************************************************/
router.route("/test").post(
// upload.single("avatar"),
upload_1.upload.none(), 
// biome-ignore lint/suspicious/useAwait: <explanation>
(0, catchAsync_1.catchAsync)(async (req, res) => {
    //  req.file?.destination + "/" + req.file?.filename;
    const imagePath = `/${req.file?.path.replace(/\\/g, "/")}`;
    // #swagger.ignore = true
    res.status(200).json({
        status: "success",
        data: {
            imagePath,
        },
    });
}));
//*******************************************************************************//
exports.default = router;
//# sourceMappingURL=index.js.map