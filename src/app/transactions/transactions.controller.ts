import {TransactionType} from "@prisma/client";
import {catchAsync} from "../../lib/catchAsync";
import type {loggedInUserType} from "../../types/user";
import {
  TransactionCreateSchema,
  TransactionUpdateSchema,
} from "./transactions.dto";
import {TransactionsRepository} from "./transactions.repository";

const transactionsRepository = new TransactionsRepository();

export class TransactionsController {
  createTransaction = catchAsync(async (req, res) => {
    const transactionData = TransactionCreateSchema.parse(req.body);
    const loggedInUser = res.locals.user as loggedInUserType;
    const companyId = loggedInUser.companyID!!;
    transactionData.createdById = loggedInUser.id;

    const createdTransaction = await transactionsRepository.createTransaction(
      companyId,
      transactionData
    );

    res.status(200).json({
      status: "success",
      data: createdTransaction,
    });
  });

  getEmployeesWallet = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;
    const companyId = loggedInUser.companyID!!;

    let page = req.query.page ? +req.query.page : 1;
    let size = req.query.size ? +req.query.size : 10;

    const result = await transactionsRepository.getCompanyNetGroupedByCreatedBy(
      companyId,
      page,
      size
    );

    res.status(200).json({
      status: "success",
      page: result.page,
      pagesCount: result.pagesCount,
      totalGroups: result.totalGroups,
      data: result.data,
    });
  });

  getAllTransactions = catchAsync(async (req, res) => {
    const loggedInUser = res.locals.user as loggedInUserType;

    const companyId = loggedInUser.companyID!!;
    const employeeId = req.query.employee_id
      ? +req.query.employee_id
      : undefined;
    const type = req.query.type?.toString() as TransactionType;

    let size = req.query.size ? +req.query.size : 10;
    if (size > 500) size = 10;

    let page = 1;
    if (
      req.query.page &&
      !Number.isNaN(+req.query.page) &&
      +req.query.page > 0
    ) {
      page = +req.query.page;
    }

    const {
      transactions,
      pagesCount,
      count,
      totalDepoist,
      totalWithdraw,
      receivedFromAgents,
      notReceived,
      forClients,
      paidToClients,
    } = await transactionsRepository.getAllTransactionsPaginated({
      page,
      size,
      companyId,
      employeeId,
      type,
    });

    res.status(200).json({
      status: "success",
      page,
      pagesCount,
      data: transactions,
      count,
      totalDepoist,
      totalWithdraw,
      total: totalDepoist - totalWithdraw,
      receivedFromAgents,
      notReceived,
      forClients,
      paidToClients,
    });
  });

  getTransaction = catchAsync(async (req, res) => {
    const transactionId = +req.params.transactionId;
    const transaction = await transactionsRepository.getTransaction({
      transactionId,
    });

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  });

  updateTransaction = catchAsync(async (req, res) => {
    const transactionId = +req.params.transactionId;
    const transactionData = TransactionUpdateSchema.parse(req.body);

    const updatedTransaction = await transactionsRepository.updateTransaction({
      transactionId,
      transactionData,
    });

    res.status(200).json({
      status: "success",
      data: updatedTransaction,
    });
  });

  deleteTransaction = catchAsync(async (req, res) => {
    const transactionId = +req.params.transactionId;
    await transactionsRepository.deleteTransaction({transactionId});

    res.status(200).json({
      status: "success",
    });
  });
}
