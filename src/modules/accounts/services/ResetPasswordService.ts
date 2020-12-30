import { injectable, inject } from 'tsyringe';
import { differenceInHours } from 'date-fns';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IAccountTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';
import IHashProvider from '@modules/accounts/providers/HashProvider/models/IHashProvider';

interface IRequest {
  token: string;
  password: string;
}

@injectable()
class ResetPasswordService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('AccountTokensRepository')
    private accountTokensRepository: IAccountTokensRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({ token, password }: IRequest): Promise<void> {
    const accountToken = await this.accountTokensRepository.findByToken(token);

    if (!accountToken) {
      throw new AppError('Token does not exists');
    }

    const account = await this.accountsRepository.findById(accountToken?.id);

    if (!account) {
      throw new AppError('User/Store does not exists');
    }

    const tokenCreatedAt = accountToken.created_at;

    if (differenceInHours(Date.now(), tokenCreatedAt) > 2) {
      throw new AppError('Token expired.');
    }

    account.password = await this.hashProvider.generateHash(password);

    await this.accountsRepository.save(account);
  }
}

export default ResetPasswordService;
