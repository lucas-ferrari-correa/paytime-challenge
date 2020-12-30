import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeAccountTokensRepository from '@modules/accounts/repositories/fakes/FakeAccountTokensRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import ResetPasswordService from './ResetPasswordService';

import AuthenticateUserAccountService from './AuthenticateUserAccountService';

import CreateStoreAccountService from './CreateStoreAccountService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeAccountTokensRepository: FakeAccountTokensRepository;
let resetPassword: ResetPasswordService;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createStoreAccount: CreateStoreAccountService;

describe('ResetPasswordService', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeAccountTokensRepository = new FakeAccountTokensRepository();
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

    resetPassword = new ResetPasswordService(
      fakeAccountsRepository,
      fakeAccountTokensRepository,
      fakeHashProvider,
    );
  });

  it('should be able to reset the password of user account', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const { token } = await fakeAccountTokensRepository.generate(
      userAccount.id,
    );

    const generateHash = jest.spyOn(fakeHashProvider, 'generateHash');

    await resetPassword.execute({
      password: 'PtPt2021*',
      token,
    });

    const updatedUserAccount = await fakeAccountsRepository.findById(
      userAccount.id,
    );

    expect(generateHash).toHaveBeenCalledWith('PtPt2021*');
    expect(updatedUserAccount?.password).toBe('PtPt2021*');
  });

  it('should be able to reset the password of store account', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
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

    const { token } = await fakeAccountTokensRepository.generate(
      storeAccount.id,
    );

    const generateHash = jest.spyOn(fakeHashProvider, 'generateHash');

    await resetPassword.execute({
      password: 'PtPt2021*',
      token,
    });

    const updatedStoreAccount = await fakeAccountsRepository.findById(
      storeAccount.id,
    );

    expect(generateHash).toHaveBeenCalledWith('PtPt2021*');
    expect(updatedStoreAccount?.password).toBe('PtPt2021*');
  });

  it('should not be able to reset the password with non-existing token', async () => {
    await expect(
      resetPassword.execute({
        token: 'non-existing-token',
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset the password with non-existing account', async () => {
    const { token } = await fakeAccountTokensRepository.generate(
      'non-existing-user',
    );

    await expect(
      resetPassword.execute({
        token,
        password: 'PtPt2021*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset password if passed more than 2 hours (user account)', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const { token } = await fakeAccountTokensRepository.generate(
      userAccount.id,
    );

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const customDate = new Date();

      return customDate.setHours(customDate.getHours() + 3);
    });

    await expect(
      resetPassword.execute({
        password: 'PtPt2021*',
        token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset password if passed more than 2 hours (store account)', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
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

    const { token } = await fakeAccountTokensRepository.generate(
      storeAccount.id,
    );

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const customDate = new Date();

      return customDate.setHours(customDate.getHours() + 3);
    });

    await expect(
      resetPassword.execute({
        password: 'PtPt2021*',
        token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
