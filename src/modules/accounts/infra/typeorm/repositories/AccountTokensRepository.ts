import { getRepository, Repository } from 'typeorm';

import IUserTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';

import AccountToken from '@modules/accounts/infra/typeorm/entities/AccountToken';

class AccountTokensRepository implements IUserTokensRepository {
  private ormRepository: Repository<AccountToken>;

  constructor() {
    this.ormRepository = getRepository(AccountToken);
  }

  public async findByToken(token: string): Promise<AccountToken | undefined> {
    const accountToken = await this.ormRepository.findOne({
      where: { token },
    });

    return accountToken;
  }

  public async generate(account_id: string): Promise<AccountToken> {
    const accountToken = this.ormRepository.create({
      account_id,
    });

    await this.ormRepository.save(accountToken);

    return accountToken;
  }
}

export default AccountTokensRepository;
