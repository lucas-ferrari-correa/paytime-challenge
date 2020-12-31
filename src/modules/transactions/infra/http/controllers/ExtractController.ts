import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import ListExtractsService from '@modules/transactions/services/ListExtractsService';

export default class TransactionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { initialDateDay, initialDateMonth, initialDateYear } = request.body;
    const { id } = request.account;

    const listExtracts = container.resolve(ListExtractsService);

    const document = await listExtracts.execute({
      initialDateDay,
      initialDateMonth,
      initialDateYear,
      id,
    });

    return response.json(classToClass(document));
  }
}
