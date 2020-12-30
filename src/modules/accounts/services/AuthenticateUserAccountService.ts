import { sign } from 'jsonwebtoken';
import authConfig from '@config/auth';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IHashProvider from '@modules/accounts/providers/HashProvider/implementations/BCryptHashProvider';

import Account from '@modules/accounts/infra/typeorm/entities/Account';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  account: Account;
  token: string;
}

@injectable()
class AuthenticateUserAccountService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const account = await this.accountsRepository.findByEmail(email);

    if (!account) {
      throw new AppError('Incorrect email/password combination.', 401);
    }

    const passwordMatched = await this.hashProvider.compareHash(
      password,
      account.password,
    );

    if (!passwordMatched) {
      throw new AppError('Incorrect email/password combination.', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: account.id,
      expiresIn,
    });

    return {
      account,
      token,
    };
  }
}

export default AuthenticateUserAccountService;
