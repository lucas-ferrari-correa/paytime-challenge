import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashRepository from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import AuthenticateStoreAccountService from './AuthenticateStoreAccountService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashRepository;
let authenticateStoreAccount: AuthenticateStoreAccountService;

describe('AuthenticateStoreAccount', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashRepository();

    authenticateStoreAccount = new AuthenticateStoreAccountService(
      fakeAccountsRepository,
      fakeHashProvider,
    );
  });

  it('should be able to authenticate an store account', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const storeAccount = await fakeAccountsRepository.createStoreAccount({
      accountName: 'John Doe',
      cnpj: '11111111111180',
      password: 'PtPt2021*',
      accountUserId: userAccount.id,
      amount: 0,
    });

    const response = await authenticateStoreAccount.execute({
      cnpj: '11111111111180',
      password: 'PtPt2021*',
    });

    expect(response).toHaveProperty('token');
    expect(response.account).toEqual(storeAccount);
  });

  it('should not be able to authenticate with non existing store', async () => {
    await expect(
      authenticateStoreAccount.execute({
        cnpj: '11111111111180',
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with wrong password', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await fakeAccountsRepository.createStoreAccount({
      accountName: 'John Doe',
      cnpj: '11111111111180',
      password: 'PtPt2021*',
      accountUserId: userAccount.id,
      amount: 0,
    });

    await expect(
      authenticateStoreAccount.execute({
        cnpj: '11111111111180',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
