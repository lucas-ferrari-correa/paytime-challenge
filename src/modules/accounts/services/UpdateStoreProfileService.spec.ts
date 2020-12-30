import AppError from '@shared/errors/AppError';

import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';

import UpdateStoreProfileService from './UpdateStoreProfileService';

import AuthenticateUserAccountService from './AuthenticateUserAccountService';

import CreateStoreAccountService from './CreateStoreAccountService';
import CreateUserAccountService from './CreateUserAccountService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;

let updateStoreProfileService: UpdateStoreProfileService;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createUserAccount: CreateUserAccountService;
let createStoreAccount: CreateStoreAccountService;

describe('UpdateUserProfile', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCacheProvider = new FakeCacheProvider();
    fakeCpfCnpjProvider = new FakeCpfCnpjProvider();

    updateStoreProfileService = new UpdateStoreProfileService(
      fakeAccountsRepository,
      fakeHashProvider,
    );

    authenticateUserAccountService = new AuthenticateUserAccountService(
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

  it('should be able to update the profile of a store account', async () => {
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

    const updatedStore = await updateStoreProfileService.execute({
      account_store_id: storeAccount.id,
      accountName: 'John Tre',
      cnpj: '11111111111180',
      accountUserId: userAccount.id,
    });

    expect(updatedStore.accountName).toBe('John Tre');
    expect(updatedStore.cnpj).toBe('11111111111180');
  });

  it('should not be able to update the profile from non-existing store', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    expect(
      updateStoreProfileService.execute({
        account_store_id: 'non-existing-store-id',
        accountName: 'John Tre',
        cnpj: '11111111111180',
        accountUserId: userAccount.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to change to another user cnpj already in use', async () => {
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

    const storeAccount = await createStoreAccount.execute(
      {
        accountName: 'John Doe 2',
        cnpj: '22222222222259',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    await expect(
      updateStoreProfileService.execute({
        account_store_id: storeAccount.id,
        accountName: 'John Doe 2',
        cnpj: '11111111111180',
        accountUserId: userAccount.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update the password', async () => {
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

    const updatedStore = await updateStoreProfileService.execute({
      account_store_id: storeAccount.id,
      accountName: 'John Tre',
      cnpj: '11111111111180',
      accountUserId: userAccount.id,
      old_password: 'PtPt2021*',
      password: 'PtPt2022*',
    });

    expect(updatedStore.password).toBe('PtPt2022*');
  });

  it('should not be able to update the password without old password', async () => {
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
      updateStoreProfileService.execute({
        account_store_id: storeAccount.id,
        accountName: 'John Doe',
        cnpj: '11111111111180',
        accountUserId: userAccount.id,
        password: 'PtPt2022*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update the password without wrong old password', async () => {
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
      updateStoreProfileService.execute({
        account_store_id: storeAccount.id,
        accountName: 'John Doe',
        cnpj: '11111111111180',
        accountUserId: userAccount.id,
        old_password: 'wrong-old-password',
        password: 'PtPt2022*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
