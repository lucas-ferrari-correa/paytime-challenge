import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateDepositsService from '@modules/transactions/services/CreateDepositsService';

export default class DepositController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { gotoAccountId, depositName, amount } = request.body;

    const createDeposits = container.resolve(CreateDepositsService);

    const document = await createDeposits.execute({
      gotoAccountId,
      depositName,
      amount,
    });

    return response.json(classToClass(document));
  }
}
