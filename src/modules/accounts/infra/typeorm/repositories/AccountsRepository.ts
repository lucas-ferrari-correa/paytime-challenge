import { getRepository, IsNull, Not, Repository } from 'typeorm';

import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICreateUserAccountDTO from '@modules/accounts/dtos/ICreateUserAccountDTO';

import Account from '@modules/accounts/infra/typeorm/entities/Account';
import ICreateStoreAccountDTO from '@modules/accounts/dtos/ICreateStoreAccountDTO';

class AccountsRepository implements IAccountsRepository {
  private ormRepository: Repository<Account>;

  constructor() {
    this.ormRepository = getRepository(Account);
  }

  public async findByStoreId(id: string): Promise<Account | undefined> {
    const account = await this.ormRepository.find({
      id,
      cnpj: Not(IsNull()),
      cpf: IsNull(),
    });

    return account[0];
  }

  public async findByUserId(id: string): Promise<Account | undefined> {
    const account = await this.ormRepository.find({
      id,
      cnpj: IsNull(),
      cpf: Not(IsNull()),
    });

    return account[0];
  }

  public async findByStoreAccountsUserId(
    accountUserId: string,
  ): Promise<Account[]> {
    const storeAccounts = await this.ormRepository.find({
      accountUserId,
    });

    return storeAccounts;
  }

  public async findById(id: string): Promise<Account | undefined> {
    const account = await this.ormRepository.findOne(id);

    return account;
  }

  public async findByUserAccountId(
    accountUserId: string,
  ): Promise<Account | undefined> {
    const account = await this.ormRepository.find({
      id: accountUserId,
      cnpj: IsNull(),
      cpf: Not(IsNull()),
    });

    return account[0];
  }

  public async findByCompanyName(
    accountName: string,
  ): Promise<Account | undefined> {
    const account = await this.ormRepository.find({
      accountName,
      cnpj: Not(IsNull()),
      cpf: IsNull(),
    });

    return account[0];
  }

  public async findByEmail(email: string): Promise<Account | undefined> {
    const account = await this.ormRepository.findOne({
      where: { email },
    });

    return account;
  }

  public async findByCnpj(cnpj: string): Promise<Account | undefined> {
    const account = await this.ormRepository.findOne({
      where: { cnpj },
    });

    return account;
  }

  public async findByCpf(cpf: string): Promise<Account | undefined> {
    const account = await this.ormRepository.findOne({
      where: { cpf },
    });

    return account;
  }

  public async createUserAccount(
    accountData: ICreateUserAccountDTO,
  ): Promise<Account> {
    const account = this.ormRepository.create(accountData);

    await this.ormRepository.save(account);

    return account;
  }

  public async createStoreAccount(
    accountData: ICreateStoreAccountDTO,
  ): Promise<Account> {
    const account = this.ormRepository.create(accountData);

    await this.ormRepository.save(account);

    return account;
  }

  public async save(account: Account): Promise<Account> {
    return this.ormRepository.save(account);
  }
}

export default AccountsRepository;
