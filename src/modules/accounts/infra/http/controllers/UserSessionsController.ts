import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import AuthenticateUserAccountService from '@modules/accounts/services/AuthenticateUserAccountService';

export default class SessionsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    const authenticateUserAccount = container.resolve(
      AuthenticateUserAccountService,
    );

    const { account, token } = await authenticateUserAccount.execute({
      email,
      password,
    });

    return response.json({ account: classToClass(account), token });
  }
}
