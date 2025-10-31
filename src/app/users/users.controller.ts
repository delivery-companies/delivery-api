import { catchAsync } from "../../lib/catchAsync";
import type { loggedInUserType } from "../../types/user";
import { UsersRepository } from "./users.repository";

const usersRepository = new UsersRepository();

export class UsersController {
  getProfile = catchAsync(async (_req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const profile = await usersRepository.getUser({
      userID: loggedInUser.id,
    });

    res.status(200).json({
      status: "success",
      data: profile,
    });
  });

  updateProfile = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const profile = await usersRepository.updateUser({
      userID: loggedInUser.id,
      userData: {
        fcm: req.body.fcm,
      },
    });

    res.status(200).json({
      status: "success",
      data: profile,
    });
  });
  getUsersLoginHistory = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const userID = req.query.user_id ? +req.query.user_id : undefined;

    let size = req.query.size ? +req.query.size : 10;
    if (size > 500) {
      size = 10;
    }
    let page = 1;
    if (
      req.query.page &&
      !Number.isNaN(+req.query.page) &&
      +req.query.page > 0
    ) {
      page = +req.query.page;
    }

    const { loginHistory, pagesCount } =
      await usersRepository.getUsersLoginHistoryPaginated({
        loggedInUser: loggedInUser,
        userID,
        filters: {
          page,
          size,
        },
      });

    res.status(200).json({
      status: "success",
      page: page,
      pagesCount: pagesCount,
      data: loginHistory,
    });
  });
}
