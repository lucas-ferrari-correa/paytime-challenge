import { uuid } from 'uuidv4';

import IAccountTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';

import AccountToken from '@modules/accounts/infra/typeorm/entities/AccountToken';

class FakeUserTokensRepository implements IAccountTokensRepository {
  private accountTokens: AccountToken[] = [];

  public async generate(account_id: string): Promise<AccountToken> {
    const accountToken = new AccountToken();

    Object.assign(accountToken, {
      id: uuid(),
      token: uuid(),
      account_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.accountTokens.push(accountToken);

    return accountToken;
  }

  public async findByToken(token: string): Promise<AccountToken | undefined> {
    const accountToken = this.accountTokens.find(
      findToken => findToken.token === token,
    );

    return accountToken;
  }
}

export default FakeUserTokensRepository;
