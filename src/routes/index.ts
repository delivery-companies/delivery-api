import {Router} from "express";
import authRoutes from "../app/auth/auth.routes";
import automaticUpdatesRoutes from "../app/automatic-updates/automaticUpdates.routes";
import bannersRoutes from "../app/banners/banners.routes";
import branchesRoutes from "../app/branches/branches.routes";
import categoriesRoutes from "../app/categories/categories.routes";
import clientsRoutes from "../app/clients/clients.routes";
import colorsRoutes from "../app/colors/colors.routes";
import companiesRoutes from "../app/companies/companies.routes";
import employeesRoutes from "../app/employees/employees.routes";
import locationsRoutes from "../app/locations/locations.routes";
import notificationsRoutes from "../app/notifications/notifications.routes";
import ordersRoutes from "../app/orders/orders.routes";
import productsRoutes from "../app/products/products.routes";
import reportsRoutes from "../app/reports/reports.routes";
import repositoriesRoutes from "../app/repositories/repositories.routes";
import sizesRoutes from "../app/sizes/sizes.routes";
import storesRoutes from "../app/stores/stores.routes";
import usersRoutes from "../app/users/users.routes";
import statusRoutes from "../app/ClosedStatus/closedStatus.routes";
import clientReceiptsRoutes from "../app/clientReceipts/clientReceipts.routes";
import cutomerOutput from "../app/customerOutputs/customerOutput.routes";
import departments from "../app/departments/deparment.routes";
import tickets from "../app/tickets/tickets.routes";
import message from "../app/messages/messages.routes";
import transactions from "../app/transactions/transactions.routes";
import {catchAsync} from "../lib/catchAsync";
import {upload} from "../middlewares/upload";

const router = Router();

router.use("/", authRoutes);
router.use("/", employeesRoutes);
router.use("/", repositoriesRoutes);
router.use("/", clientsRoutes);
router.use("/", branchesRoutes);
router.use("/", locationsRoutes);
router.use("/", companiesRoutes);
router.use("/", ordersRoutes);
router.use("/", productsRoutes);
router.use("/", categoriesRoutes);
router.use("/", notificationsRoutes);
router.use("/", colorsRoutes);
router.use("/", sizesRoutes);
router.use("/", storesRoutes);
router.use("/", bannersRoutes);
router.use("/", reportsRoutes);
router.use("/", automaticUpdatesRoutes);
router.use("/", usersRoutes);
router.use("/", clientReceiptsRoutes);
router.use("/", cutomerOutput);
router.use("/", departments);
router.use("/", tickets);
router.use("/", message);
router.use("/", statusRoutes);
router.use("/", transactions);

/*******************************************************************************
 * TEST ROUTES
 * TODO: Remove these routes
 *******************************************************************************/

router.route("/test").post(
  // upload.single("avatar"),
  upload.none(),
  // biome-ignore lint/suspicious/useAwait: <explanation>
  catchAsync(async (req, res) => {
    //  req.file?.destination + "/" + req.file?.filename;
    const imagePath = `/${req.file?.path.replace(/\\/g, "/")}`;
    // #swagger.ignore = true
    res.status(200).json({
      status: "success",
      data: {
        imagePath,
      },
    });
  })
);

//*******************************************************************************//

export default router;
