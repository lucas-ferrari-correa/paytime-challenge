import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateStoreAccountService from '@modules/accounts/services/CreateStoreAccountService';

export default class UserAccountsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const data = request.body;

    const createStoreAccount = container.resolve(CreateStoreAccountService);

    const account = await createStoreAccount.execute(data, request.account.id);

    return response.json(classToClass(account));
  }
}
