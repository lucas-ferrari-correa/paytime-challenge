import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import Account from '@modules/accounts/infra/typeorm/entities/Account';
import { classToClass } from 'class-transformer';
import ICreateStoreAccountDTO from '../dtos/ICreateStoreAccountDTO';

interface IRequest {
  account_id: string;
}

@injectable()
class ShowStoreProfileService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({
    account_id,
  }: IRequest): Promise<ICreateStoreAccountDTO> {
    let storeAccount = await this.cacheProvider.recover<Account>(
      `stores-list:${account_id}:*`,
    );

    if (!storeAccount) {
      storeAccount = await this.accountsRepository.findByStoreId(account_id);

      if (!storeAccount) {
        throw new AppError('This JWT token is not from a store account');
      }

      await this.cacheProvider.save(
        `stores-list:${account_id}:${storeAccount.accountUserId}`,
        classToClass(storeAccount),
      );
    }

    return storeAccount;
  }
}

export default ShowStoreProfileService;
