import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import AuthenticateUserAccountService from './AuthenticateUserAccountService';
import AuthenticateStoreAccountService from './AuthenticateStoreAccountService';

import CreateStoreAccountService from './CreateStoreAccountService';
import CreateUserAccountService from './CreateUserAccountService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;

let authenticateUserAccountService: AuthenticateUserAccountService;
let authenticateStoreAccountService: AuthenticateStoreAccountService;

let createUserAccount: CreateUserAccountService;
let createStoreAccount: CreateStoreAccountService;

describe('CreateStoreAccount', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCpfCnpjProvider = new FakeCpfCnpjProvider();
    fakeCacheProvider = new FakeCacheProvider();

    authenticateUserAccountService = new AuthenticateUserAccountService(
      fakeAccountsRepository,
      fakeHashProvider,
    );

    authenticateStoreAccountService = new AuthenticateStoreAccountService(
      fakeAccountsRepository,
      fakeHashProvider,
    );

    createStoreAccount = new CreateStoreAccountService(
      fakeAccountsRepository,
      fakeHashProvider,
      fakeCacheProvider,
      fakeCpfCnpjProvider,
    );

    createUserAccount = new CreateUserAccountService(
      fakeAccountsRepository,
      fakeHashProvider,
      fakeCacheProvider,
      fakeCpfCnpjProvider,
    );
  });

  it('should be able to create a new store account', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const storeAccount = await createStoreAccount.execute(
      {
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    expect(storeAccount).toHaveProperty('id');
  });

  it('should not be able to create a new store account with a store account token', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await createStoreAccount.execute(
      {
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    const authenticatedStore = await authenticateStoreAccountService.execute({
      cnpj: '11111111111180',
      password: 'PtPt2021*',
    });

    await expect(
      createStoreAccount.execute(
        {
          accountName: 'John Doe',
          cnpj: '11111111111260',
          password: 'PtPt2021*',
          accountUserId: userAccount.id,
        },
        authenticatedStore.token,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new store account with same cnpj', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await createStoreAccount.execute(
      {
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    await expect(
      createStoreAccount.execute(
        {
          accountName: 'John Doe',
          cnpj: '11111111111180',
          password: 'PtPt2021*',
          accountUserId: userAccount.id,
        },
        authenticatedUser.account.id,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new store account with badly formatted cnpj', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await expect(
      createStoreAccount.execute(
        {
          accountName: 'John Doe',
          cnpj: '11111111111179',
          password: 'PtPt2021*',
          accountUserId: userAccount.id,
        },
        authenticatedUser.account.id,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new store account with same company name from another', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await createStoreAccount.execute(
      {
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    await expect(
      createStoreAccount.execute(
        {
          accountName: 'John Doe',
          cnpj: '11111111111260',
          password: 'PtPt2021*',
          accountUserId: userAccount.id,
        },
        authenticatedUser.account.id,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new store account with unavailable user account', async () => {
    await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    await expect(
      createStoreAccount.execute(
        {
          accountName: 'John Doe',
          cnpj: '11111111111180',
          password: 'PtPt2021*',
          accountUserId: 'wrong-user-id',
        },
        authenticatedUser.account.id,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new store account with unavailable user account (using store account id)', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const storeAccount = await createStoreAccount.execute(
      {
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    await expect(
      createStoreAccount.execute(
        {
          accountName: 'John Doe',
          cnpj: '11111111111180',
          password: 'PtPt2021*',
          accountUserId: storeAccount.id,
        },
        authenticatedUser.account.id,
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to create multiples store accounts to the same user account', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const authenticatedUser = await authenticateUserAccountService.execute({
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const storeAccount1 = await createStoreAccount.execute(
      {
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    const storeAccount2 = await createStoreAccount.execute(
      {
        accountName: 'John Doe 2',
        cnpj: '11111111111260',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    expect(storeAccount1).toHaveProperty('id');
    expect(storeAccount2).toHaveProperty('id');
  });
});
