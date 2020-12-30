import AccountToken from '@modules/accounts/infra/typeorm/entities/AccountToken';

export default interface IAccountTokensRepository {
  generate(user_id: string): Promise<AccountToken>;
  findByToken(token: string): Promise<AccountToken | undefined>;
}
