import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

import ICreateStoreAccountDTO from '../dtos/ICreateStoreAccountDTO';

interface IRequest {
  account_id: string;
}

@injectable()
class ShowStoreProfileService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  public async execute({
    account_id,
  }: IRequest): Promise<ICreateStoreAccountDTO> {
    const checkStoreAccount = await this.accountsRepository.findByStoreId(
      account_id,
    );

    if (!checkStoreAccount) {
      throw new AppError('This JWT token is not from a store account');
    }

    const storeAccount = await this.accountsRepository.findById(account_id);

    if (!storeAccount) {
      throw new AppError('Store account not found');
    }

    return storeAccount;
  }
}

export default ShowStoreProfileService;
