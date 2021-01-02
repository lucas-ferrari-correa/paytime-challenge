import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import Account from '@modules/accounts/infra/typeorm/entities/Account';
import ICreateUserAccountDTO from '../dtos/ICreateUserAccountDTO';
import ICreateStoreAccountDTO from '../dtos/ICreateStoreAccountDTO';

interface IRequest {
  account_id: string;
}

interface IUserProfile extends ICreateUserAccountDTO {
  storeAccounts: ICreateStoreAccountDTO[];
}

@injectable()
class ShowUserProfileService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({ account_id }: IRequest): Promise<IUserProfile> {
    let userAccount = await this.cacheProvider.recover<Account>(
      `users-list:${account_id}`,
    );

    if (!userAccount) {
      userAccount = await this.accountsRepository.findByUserId(account_id);

      if (!userAccount) {
        throw new AppError('This JWT token is not from an user account');
      }
    }

    let storeAccounts = await this.cacheProvider.recover<Account[]>(
      `stores-list:*:${account_id}`,
    );

    if (!storeAccounts) {
      storeAccounts = await this.accountsRepository.findByStoreAccountsUserId(
        account_id,
      );
    }

    const objectStoreAccounts = {
      storeAccounts,
    };

    const profileUserAccount: IUserProfile = Object.assign(
      userAccount,
      objectStoreAccounts,
    );

    return profileUserAccount;
  }
}

export default ShowUserProfileService;
