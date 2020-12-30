import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateTransactionService from '@modules/transactions/services/CreateTransactionService';

export default class TransactionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { gotoAccountId, amount } = request.body;
    const { id } = request.account;

    const createTransaction = container.resolve(CreateTransactionService);

    const document = await createTransaction.execute({
      gotoAccountId,
      amount,
      fromId: id,
    });

    return response.json(classToClass(document));
  }
}
