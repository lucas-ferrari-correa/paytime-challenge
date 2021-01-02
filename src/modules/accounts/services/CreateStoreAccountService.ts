import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IHashProvider from '@modules/accounts/providers/HashProvider/implementations/BCryptHashProvider';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import Account from '@modules/accounts/infra/typeorm/entities/Account';
import { classToClass } from 'class-transformer';
import ICpfCnpjProvider from '../providers/CpfCnpjProvider/models/ICpfCnpjProvider';

interface IRequest {
  accountName: string;
  cnpj: string;
  password: string;
  accountUserId: string;
}

@injectable()
class CreateStoreAccountService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,

    @inject('CpfCnpjProvider')
    private cpfCnpjProvider: ICpfCnpjProvider,
  ) {}

  public async execute(
    data: IRequest,
    tokenAccountId: string,
  ): Promise<Account> {
    const accountData = data;

    const checkTokenAccountId = await this.accountsRepository.findByUserId(
      tokenAccountId,
    );

    if (!checkTokenAccountId) {
      throw new AppError('JWT token is not from an user account');
    }

    const checkStoreAccountCnpjIsFormatted = await this.cpfCnpjProvider.checkCnpjFormat(
      accountData.cnpj,
    );

    if (!checkStoreAccountCnpjIsFormatted) {
      throw new AppError('The field cnpj is badly formatted');
    }

    const checkStoreAccountCnpjExists = await this.accountsRepository.findByCnpj(
      accountData.cnpj,
    );

    if (checkStoreAccountCnpjExists) {
      throw new AppError('Already exists an account with this cnpj');
    }

    const checkStoreAccountCompanyNameExists = await this.accountsRepository.findByCompanyName(
      accountData.accountName,
    );

    if (checkStoreAccountCompanyNameExists) {
      throw new AppError('Already exists an account with this company name');
    }

    const checkStoreAccountUserId = await this.accountsRepository.findByUserAccountId(
      accountData.accountUserId,
    );

    if (!checkStoreAccountUserId) {
      throw new AppError('User account Id unavailable.');
    }

    const hashedPassword = await this.hashProvider.generateHash(
      accountData.password,
    );

    const account = await this.accountsRepository.createStoreAccount({
      accountName: accountData.accountName,
      cnpj: accountData.cnpj,
      password: hashedPassword,
      accountUserId: accountData.accountUserId,
      amount: 0,
    });

    await this.cacheProvider.save(
      `stores-list:${account.id}:${account.accountUserId}`,
      classToClass(account),
    );

    return account;
  }
}

export default CreateStoreAccountService;
