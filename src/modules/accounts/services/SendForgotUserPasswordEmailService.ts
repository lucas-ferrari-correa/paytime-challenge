import { injectable, inject } from 'tsyringe';
import path from 'path';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IAccountTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';

interface IRequest {
  email: string;
  cpf: string;
}

@injectable()
class SendForgotUserPasswordEmailService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('AccountTokensRepository')
    private accountTokensRepository: IAccountTokensRepository,
  ) {}

  public async execute({ email, cpf }: IRequest): Promise<void> {
    const userAccount = await this.accountsRepository.findByEmail(email);

    if (!userAccount || userAccount.cpf !== cpf) {
      throw new AppError('Email/Cpf does not match with any user account.');
    }

    const { token } = await this.accountTokensRepository.generate(
      userAccount.id,
    );

    const forgotPasswordTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'forgot_password.hbs',
    );

    await this.mailProvider.sendMail({
      to: {
        name: userAccount.accountName,
        email: userAccount.email,
      },
      subject: '[Paytime Challenge] Recuperação de senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: `${userAccount.accountName} [conta usuário]`,
          token: `${token}`,
        },
      },
    });
  }
}

export default SendForgotUserPasswordEmailService;
