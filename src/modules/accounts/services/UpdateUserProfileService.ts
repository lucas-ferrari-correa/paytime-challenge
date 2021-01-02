import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IHashProvider from '@modules/accounts/providers/HashProvider/models/IHashProvider';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import Account from '@modules/accounts/infra/typeorm/entities/Account';
import { classToClass } from 'class-transformer';

interface IRequest {
  account_user_id: string;
  accountName: string;
  cpf: string;
  email: string;
  old_password?: string;
  password?: string;
}

@injectable()
class UpdateProfileService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({
    account_user_id,
    accountName,
    cpf,
    email,
    password,
    old_password,
  }: IRequest): Promise<Account> {
    const accountUser = await this.accountsRepository.findByUserId(
      account_user_id,
    );

    if (!accountUser) {
      throw new AppError('User account not found');
    }

    const accountUserWithUpdatedEmail = await this.accountsRepository.findByEmail(
      email,
    );

    if (
      accountUserWithUpdatedEmail &&
      accountUserWithUpdatedEmail.id !== account_user_id
    ) {
      throw new AppError('E-mail already in use.');
    }

    const accountUserWithUpdatedCpf = await this.accountsRepository.findByCpf(
      cpf,
    );

    if (
      accountUserWithUpdatedCpf &&
      accountUserWithUpdatedCpf.id !== account_user_id
    ) {
      throw new AppError('Cpf already in use.');
    }

    accountUser.accountName = accountName;
    accountUser.email = email;

    if (password && !old_password) {
      throw new AppError(
        'You need to inform the old password to set a new password.',
      );
    }

    if (password && old_password) {
      const checkOldPassword = await this.hashProvider.compareHash(
        old_password,
        accountUser.password,
      );

      if (!checkOldPassword) {
        throw new AppError('Old password does not match.');
      }

      accountUser.password = await this.hashProvider.generateHash(password);
    }

    const updatedUserAccount = await this.accountsRepository.save(accountUser);

    await this.cacheProvider.save(
      `users-list:${updatedUserAccount.id}`,
      classToClass(updatedUserAccount),
    );

    return updatedUserAccount;
  }
}

export default UpdateProfileService;
