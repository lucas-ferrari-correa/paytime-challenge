import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import AuthenticateStoreAccountService from '@modules/accounts/services/AuthenticateStoreAccountService';

export default class SessionsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { cnpj, password } = request.body;

    const authenticateStoreAccount = container.resolve(
      AuthenticateStoreAccountService,
    );

    const { account, token } = await authenticateStoreAccount.execute({
      cnpj,
      password,
    });

    return response.json({ account: classToClass(account), token });
  }
}
