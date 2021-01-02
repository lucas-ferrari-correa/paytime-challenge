import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import AuthenticateUserAccountService from './AuthenticateUserAccountService';

import CreateStoreAccountService from './CreateStoreAccountService';
import CreateUserAccountService from './CreateUserAccountService';

import ShowProfileService from './ShowUserProfileService';

import ICreateUserAccountDTO from '../dtos/ICreateUserAccountDTO';
import ICreateStoreAccountDTO from '../dtos/ICreateStoreAccountDTO';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createUserAccount: CreateUserAccountService;
let createStoreAccount: CreateStoreAccountService;
let showProfile: ShowProfileService;

interface IUserProfile extends ICreateUserAccountDTO {
  storeAccounts: ICreateStoreAccountDTO[];
}

describe('ShowUserProfile', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCpfCnpjProvider = new FakeCpfCnpjProvider();
    fakeCacheProvider = new FakeCacheProvider();

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

    showProfile = new ShowProfileService(
      fakeAccountsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to show the profile of an user account', async () => {
    const userAccount = await createUserAccount.execute({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
    });

    const userProfile: IUserProfile = await showProfile.execute({
      account_id: userAccount.id,
    });

    expect(userProfile.accountName).toBe('John Doe');
    expect(userProfile.cpf).toBe('11111111111');
    expect(userProfile.email).toBe('johndoe@example.com');
    expect(userProfile.storeAccounts).toEqual([]);
  });

  it('should be able to show the profile of an user account with multiple store accounts', async () => {
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

    const storeAccount2 = await createStoreAccount.execute(
      {
        accountName: 'John Doe 2',
        cnpj: '11111111111260',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
      },
      authenticatedUser.account.id,
    );

    const userProfile: IUserProfile = await showProfile.execute({
      account_id: userAccount.id,
    });

    expect(userProfile.accountName).toBe('John Doe');
    expect(userProfile.cpf).toBe('11111111111');
    expect(userProfile.email).toBe('johndoe@example.com');
    expect(userProfile.storeAccounts).toEqual([
      {
        id: storeAccount.id,
        accountName: 'John Doe',
        cnpj: '11111111111180',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
        amount: 0,
      },
      {
        id: storeAccount2.id,
        accountName: 'John Doe 2',
        cnpj: '11111111111260',
        password: 'PtPt2021*',
        accountUserId: userAccount.id,
        amount: 0,
      },
    ]);
  });

  it('should not be able to show the profile from non-existing user', async () => {
    expect(
      showProfile.execute({
        account_id: 'non-existing-account-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
