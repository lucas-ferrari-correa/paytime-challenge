import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IHashProvider from '@modules/accounts/providers/HashProvider/models/IHashProvider';

import Account from '@modules/accounts/infra/typeorm/entities/Account';

interface IRequest {
  account_store_id: string;
  accountName: string;
  cnpj: string;
  accountUserId: string;
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
  ) {}

  public async execute({
    account_store_id,
    accountName,
    cnpj,
    accountUserId,
    password,
    old_password,
  }: IRequest): Promise<Account> {
    const accountStore = await this.accountsRepository.findByStoreId(
      account_store_id,
    );

    if (!accountStore) {
      throw new AppError('Store account not found');
    }

    const accountStoreWithUpdatedCnpj = await this.accountsRepository.findByCnpj(
      cnpj,
    );

    if (
      accountStoreWithUpdatedCnpj &&
      accountStoreWithUpdatedCnpj.id !== account_store_id
    ) {
      throw new AppError('Cnpj already in use.');
    }

    const accountStoreWithUpdatedUserId = await this.accountsRepository.findByUserId(
      accountUserId,
    );

    if (!accountStoreWithUpdatedUserId) {
      throw new AppError('User account does not exist.');
    }

    accountStore.accountName = accountName;
    accountStore.accountUserId = accountUserId;

    if (password && !old_password) {
      throw new AppError(
        'You need to inform the old password to set a new password.',
      );
    }

    if (password && old_password) {
      const checkOldPassword = await this.hashProvider.compareHash(
        old_password,
        accountStore.password,
      );

      if (!checkOldPassword) {
        throw new AppError('Old password does not match.');
      }

      accountStore.password = await this.hashProvider.generateHash(password);
    }

    return this.accountsRepository.save(accountStore);
  }
}

export default UpdateProfileService;
