import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import CreateAccountService from './CreateUserAccountService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;
let createUserAccount: CreateAccountService;

describe('CreateUserAccount', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCpfCnpjProvider = new FakeCpfCnpjProvider();
    fakeCacheProvider = new FakeCacheProvider();
    createUserAccount = new CreateAccountService(
      fakeAccountsRepository,
      fakeHashProvider,
      fakeCacheProvider,
      fakeCpfCnpjProvider,
    );
  });

  it('should be able to create a new user account', async () => {
    const account = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    expect(account).toHaveProperty('id');
  });

  it('should not be able to create a new user account with same cpf', async () => {
    await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await expect(
      createUserAccount.execute({
        accountName: 'John Doe',
        cpf: '11111111111',
        email: 'johndoe@example.com',
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new user account with badly formatted cpf', async () => {
    await expect(
      createUserAccount.execute({
        accountName: 'John Doe',
        cpf: '11111111112',
        email: 'johndoe@example.com',
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new account with same email from another', async () => {
    await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await expect(
      createUserAccount.execute({
        accountName: 'John Doe',
        cpf: '99999999999',
        email: 'johndoe@example.com',
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
