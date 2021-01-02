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
  email: string;
  cpf: string;
  password: string;
}

@injectable()
class CreateUserAccountService {
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

  public async execute(data: IRequest): Promise<Account> {
    const accountData = data;

    const checkUserAccountCpfExists = await this.accountsRepository.findByCpf(
      accountData.cpf,
    );

    if (checkUserAccountCpfExists) {
      throw new AppError('Already exists an account with this cpf');
    }

    const checkUserAccountCpfIsFormatted = await this.cpfCnpjProvider.checkCpfFormat(
      accountData.cpf,
    );

    if (!checkUserAccountCpfIsFormatted) {
      throw new AppError('The field cpf is badly formatted');
    }

    const checkUserAccountEmailExists = await this.accountsRepository.findByEmail(
      accountData.email,
    );

    if (checkUserAccountEmailExists) {
      throw new AppError(
        'Another user account with same e-mail already exists',
      );
    }

    const hashedPassword = await this.hashProvider.generateHash(
      accountData.password,
    );

    const account = await this.accountsRepository.createUserAccount({
      accountName: accountData.accountName,
      cpf: accountData.cpf,
      email: accountData.email,
      password: hashedPassword,
      amount: 0,
    });

    await this.cacheProvider.save(
      `users-list:${account.id}`,
      classToClass(account),
    );

    return account;
  }
}

export default CreateUserAccountService;
