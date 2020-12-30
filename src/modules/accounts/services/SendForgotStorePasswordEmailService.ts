import { injectable, inject } from 'tsyringe';
import path from 'path';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IAccountTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';

interface IRequest {
  email: string;
  cnpj: string;
}

@injectable()
class SendForgotPasswordEmailService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('AccountTokensRepository')
    private accountTokensRepository: IAccountTokensRepository,
  ) {}

  public async execute({ email, cnpj }: IRequest): Promise<void> {
    const storeAccount = await this.accountsRepository.findByCnpj(cnpj);

    if (!storeAccount) {
      throw new AppError('Email/Cnpj does not match.');
    }

    const emailUserAccount = await this.accountsRepository.findByEmail(email);

    if (!emailUserAccount) {
      throw new AppError('Email/Cnpj does not match.');
    }

    const storeUserId = await this.accountsRepository.findByStoreAccountsUserId(
      emailUserAccount.id,
    );

    const checkStoreUserId = storeUserId.find(account => {
      return account.id === storeAccount.id;
    });

    if (!checkStoreUserId) {
      throw new AppError('Email/Cnpj does not match.');
    }

    const { token } = await this.accountTokensRepository.generate(
      storeAccount.id,
    );

    const forgotPasswordTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'forgot_password.hbs',
    );

    await this.mailProvider.sendMail({
      to: {
        name: storeAccount.accountName,
        email: emailUserAccount.email,
      },
      subject: '[Paytime Challenge] Recuperação de senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: `${storeAccount.accountName} [conta estabelecimento]`,
          token: `${token}`,
        },
      },
    });
  }
}

export default SendForgotPasswordEmailService;
