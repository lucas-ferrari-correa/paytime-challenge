import { uuid } from 'uuidv4';

import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICreateUserAccountDTO from '@modules/accounts/dtos/ICreateUserAccountDTO';

import Account from '@modules/accounts/infra/typeorm/entities/Account';
import ICreateStoreAccountDTO from '@modules/accounts/dtos/ICreateStoreAccountDTO';

class FakeAccountsRepository implements IAccountsRepository {
  private accounts: Account[] = [];

  public async findByStoreId(id: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => {
      return account.id === id && !account.cpf && account.cnpj;
    });

    return findAccount;
  }

  public async findByUserId(id: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => {
      return account.id === id && account.cpf && !account.cnpj;
    });

    return findAccount;
  }

  public async findByStoreAccountsUserId(
    accountUserId: string,
  ): Promise<Account[]> {
    const storeAccounts = this.accounts.filter(
      account => account.accountUserId === accountUserId,
    );

    return storeAccounts;
  }

  public async findByUserAccountId(
    accountUserId: string,
  ): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => {
      return account.id === accountUserId && account.cpf && !account.cnpj;
    });

    return findAccount;
  }

  public async findById(id: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => account.id === id);

    return findAccount;
  }

  public async findByCompanyName(
    accountName: string,
  ): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => {
      if (account.accountName === accountName && account.cnpj && !account.cpf) {
        return account;
      }
      return undefined;
    });

    return findAccount;
  }

  public async findByEmail(email: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => account.email === email);

    return findAccount;
  }

  public async findByCnpj(cnpj: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => account.cnpj === cnpj);

    return findAccount;
  }

  public async findByCpf(cpf: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find(account => account.cpf === cpf);

    return findAccount;
  }

  public async createUserAccount(
    data: ICreateUserAccountDTO,
  ): Promise<Account> {
    const account = new Account();

    Object.assign(account, { id: uuid() }, data);

    this.accounts.push(account);

    return account;
  }

  public async createStoreAccount(
    data: ICreateStoreAccountDTO,
  ): Promise<Account> {
    const account = new Account();

    Object.assign(account, { id: uuid() }, data);

    this.accounts.push(account);

    return account;
  }

  public async save(account: Account): Promise<Account> {
    const findIndex = this.accounts.findIndex(
      findAccount => findAccount.id === account.id,
    );

    this.accounts[findIndex] = account;

    return account;
  }
}

export default FakeAccountsRepository;
