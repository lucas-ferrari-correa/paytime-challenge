import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateUserAccountService from '@modules/accounts/services/CreateUserAccountService';

export default class UserAccountsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const data = request.body;

    const createUserAccount = container.resolve(CreateUserAccountService);

    const account = await createUserAccount.execute(data);

    return response.json(classToClass(account));
  }
}
