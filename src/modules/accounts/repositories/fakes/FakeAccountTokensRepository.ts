import { uuid } from 'uuidv4';

import IAccountTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';

import AccountToken from '@modules/accounts/infra/typeorm/entities/AccountToken';

class FakeUserTokensRepository implements IAccountTokensRepository {
  private userTokens: AccountToken[] = [];

  public async generate(user_id: string): Promise<AccountToken> {
    const userToken = new AccountToken();

    Object.assign(userToken, {
      id: uuid(),
      token: uuid(),
      user_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.userTokens.push(userToken);

    return userToken;
  }

  public async findByToken(token: string): Promise<AccountToken | undefined> {
    const userToken = this.userTokens.find(
      findToken => findToken.token === token,
    );

    return userToken;
  }
}

export default FakeUserTokensRepository;
