import { Request, Response } from 'express';
import { container } from 'tsyringe';

import SendForgotPasswordEmailService from '@modules/accounts/services/SendForgotUserPasswordEmailService';

export default class ForgotUserPasswordController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { email, cpf } = request.body;

    const sendForgotUserPasswordEmail = container.resolve(
      SendForgotPasswordEmailService,
    );

    await sendForgotUserPasswordEmail.execute({
      email,
      cpf,
    });

    return response.status(204).json();
  }
}
