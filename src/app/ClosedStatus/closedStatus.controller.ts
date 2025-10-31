import {prisma} from "../../database/db";
import {AppError} from "../../lib/AppError";
import {catchAsync} from "../../lib/catchAsync";
import {loggedInUserType} from "../../types/user";

export class CLosedStatusController {
  createStatus = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const {status, branchId} = req.body;

    const checkIfExist = await prisma.closedStatus.findFirst({
      where: {
        orderStatus: status,
        branchId: branchId,
      },
    });
    if (checkIfExist) {
      throw new AppError("تم غلق هذه الحاله من قبل", 400);
    }

    const created = await prisma.closedStatus.create({
      data: {
        orderStatus: status,
        companyId: loggedInUser.companyID!!,
        branchId: branchId,
      },
    });

    res.status(200).json({
      status: "success",
      created,
    });
  });

  getAllStatus = catchAsync(async (req, res) => {
    const {branchId, page, size} = req.query;
    const loggedInUser = res.locals.user as loggedInUserType;

    const statues = await prisma.closedStatus.findManyPaginated(
      {
        where: {
          branchId: branchId ? +branchId : undefined,
          companyId: +loggedInUser.companyID!!,
        },
        select: {
          id: true,
          orderStatus: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          enabled: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      {
        page: +page!!,
        size: +size!!,
      }
    );

    res.status(200).json({
      data: statues.data,
      pagesCount: statues.pagesCount,
    });
  });

  getOneStatus = catchAsync(async (req, res) => {
    const {id} = req.params;
    const loggedInUser = res.locals.user as loggedInUserType;

    const status = await prisma.closedStatus.findFirst({
      where: {
        id: +id,
        companyId: +loggedInUser.companyID!!,
      },
      select: {
        id: true,
        orderStatus: true,
        branchId: true,
        enabled: true,
      },
    });

    if (!status) {
      throw new AppError("الحالة غير موجودة", 404);
    }

    res.status(200).json({status: "success", data: status});
  });

  editStatus = catchAsync(async (req, res) => {
    const {id} = req.params;
    const {status, branchId, enabled} = req.body;
    const loggedInUser = res.locals.user as loggedInUserType;

    const existing = await prisma.closedStatus.findFirst({
      where: {
        id: +id,
        companyId: +loggedInUser.companyID!!,
      },
    });

    if (!existing) {
      throw new AppError("الحالة غير موجودة", 404);
    }

    // Optional check for duplicate status in same branch
    if (status || branchId) {
      const duplicate = await prisma.closedStatus.findFirst({
        where: {
          id: {not: +id},
          orderStatus: status ?? existing.orderStatus,
          branchId: branchId ?? existing.branchId,
        },
      });
      if (duplicate) {
        throw new AppError("تم غلق هذه الحاله من قبل", 400);
      }
    }

    const updated = await prisma.closedStatus.update({
      where: {id: +id},
      data: {
        orderStatus: status ?? existing.orderStatus,
        branchId: branchId ?? existing.branchId,
        enabled: typeof enabled === "boolean" ? enabled : existing.enabled,
      },
    });

    res.status(200).json({
      status: "success",
      updated,
    });
  });

  deleteStatus = catchAsync(async (req, res) => {
    const {id} = req.params;
    const loggedInUser = res.locals.user as loggedInUserType;

    const existing = await prisma.closedStatus.findFirst({
      where: {
        id: +id,
        companyId: +loggedInUser.companyID!!,
      },
    });

    if (!existing) {
      throw new AppError("الحالة غير موجودة", 404);
    }

    await prisma.closedStatus.delete({
      where: {id: +id},
    });

    res.status(200).json({
      status: "success",
      message: "تم حذف الحالة بنجاح",
    });
  });
}
