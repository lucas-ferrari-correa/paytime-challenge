import AppError from '@shared/errors/AppError';

import FakeUserAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashRepository from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import AuthenticateUserAccountService from './AuthenticateUserAccountService';

let fakeUserAccountsRepository: FakeUserAccountsRepository;
let fakeHashProvider: FakeHashRepository;
let authenticateUserAccount: AuthenticateUserAccountService;

describe('AuthenticateUserAccount', () => {
  beforeEach(() => {
    fakeUserAccountsRepository = new FakeUserAccountsRepository();
    fakeHashProvider = new FakeHashRepository();

    authenticateUserAccount = new AuthenticateUserAccountService(
      fakeUserAccountsRepository,
      fakeHashProvider,
    );
  });

  it('should not be able to authenticate with non existing user', async () => {
    await expect(
      authenticateUserAccount.execute({
        email: 'johndoe@example.com',
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with wrong password', async () => {
    await fakeUserAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await expect(
      authenticateUserAccount.execute({
        email: 'johndoe@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to authenticate an user account', async () => {
    const account = await fakeUserAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const response = await authenticateUserAccount.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    expect(response).toHaveProperty('token');
    expect(response.account).toEqual(account);
  });
});
