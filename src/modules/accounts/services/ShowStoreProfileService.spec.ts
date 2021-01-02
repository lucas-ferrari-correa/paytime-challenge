import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import AuthenticateUserAccountService from './AuthenticateUserAccountService';

import CreateStoreAccountService from './CreateStoreAccountService';
import CreateUserAccountService from './CreateUserAccountService';

import ShowProfileService from './ShowStoreProfileService';

import ICreateStoreAccountDTO from '../dtos/ICreateStoreAccountDTO';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createUserAccount: CreateUserAccountService;
let createStoreAccount: CreateStoreAccountService;
let showProfile: ShowProfileService;

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

  it('should not be able to show the profile from non-existing store', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    expect(
      showProfile.execute({
        account_id: userAccount.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to show the store profile using an user account token', async () => {
    expect(
      showProfile.execute({
        account_id: 'non-existing-account-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to show the profile of store account', async () => {
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

    const storeProfile: ICreateStoreAccountDTO = await showProfile.execute({
      account_id: storeAccount.id,
    });

    expect(storeProfile.accountName).toBe('John Doe');
    expect(storeProfile.cnpj).toBe('11111111111180');
    expect(storeProfile.accountUserId).toEqual(userAccount.id);
  });
});
