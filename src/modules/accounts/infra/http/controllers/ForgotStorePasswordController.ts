import { Request, Response } from 'express';
import { container } from 'tsyringe';

import SendForgotStorePasswordEmailService from '@modules/accounts/services/SendForgotStorePasswordEmailService';

export default class ForgotPasswordController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { email, cnpj } = request.body;

    const sendForgotStorePasswordEmail = container.resolve(
      SendForgotStorePasswordEmailService,
    );

    await sendForgotStorePasswordEmail.execute({
      email,
      cnpj,
    });

    return response.status(204).json();
  }
}
