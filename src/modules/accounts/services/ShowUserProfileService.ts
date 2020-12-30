import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

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
  ) {}

  public async execute({ account_id }: IRequest): Promise<IUserProfile> {
    const checkUserAccount = await this.accountsRepository.findByUserId(
      account_id,
    );

    if (!checkUserAccount) {
      throw new AppError('This JWT token is not from an user account');
    }

    const userAccount = await this.accountsRepository.findById(account_id);

    if (!userAccount) {
      throw new AppError('User account not found');
    }

    const storeAccounts = await this.accountsRepository.findByStoreAccountsUserId(
      account_id,
    );

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
