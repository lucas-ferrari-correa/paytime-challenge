import Account from '@modules/accounts/infra/typeorm/entities/Account';
import ICreateUserAccountDTO from '@modules/accounts/dtos/ICreateUserAccountDTO';
import ICreateStoreAccountDTO from '@modules/accounts/dtos/ICreateStoreAccountDTO';

interface IUserAccountsRepository {
  findByStoreId(id: string): Promise<Account | undefined>;
  findByUserId(id: string): Promise<Account | undefined>;
  findByStoreAccountsUserId(accountUserId: string): Promise<Account[]>;
  findById(id: string): Promise<Account | undefined>;
  findByUserAccountId(accountUserId: string): Promise<Account | undefined>;
  findByCompanyName(accountName: string): Promise<Account | undefined>;
  findByEmail(email: string): Promise<Account | undefined>;
  findByCnpj(cnpj: string): Promise<Account | undefined>;
  findByCpf(cpf: string): Promise<Account | undefined>;
  createUserAccount(data: ICreateUserAccountDTO): Promise<Account>;
  createStoreAccount(data: ICreateStoreAccountDTO): Promise<Account>;
  save(account: Account): Promise<Account>;
}

export default IUserAccountsRepository;
