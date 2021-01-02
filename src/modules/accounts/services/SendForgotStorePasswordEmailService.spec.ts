import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeUserTokensRepository from '@modules/accounts/repositories/fakes/FakeAccountTokensRepository';
import SendForgotStorePasswordEmailService from './SendForgotStorePasswordEmailService';

import AuthenticateUserAccountService from './AuthenticateUserAccountService';

import CreateStoreAccountService from './CreateStoreAccountService';
import CreateUserAccountService from './CreateUserAccountService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeMailProvider: FakeMailProvider;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;
let fakeUserTokensRepository: FakeUserTokensRepository;
let sendForgotStorePasswordEmailService: SendForgotStorePasswordEmailService;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createUserAccount: CreateUserAccountService;
let createStoreAccount: CreateStoreAccountService;

describe('SendForgotStorePasswordEmail', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCpfCnpjProvider = new FakeCpfCnpjProvider();
    fakeCacheProvider = new FakeCacheProvider();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();

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

    sendForgotStorePasswordEmailService = new SendForgotStorePasswordEmailService(
      fakeAccountsRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });

  it('should not be able to recover a non-existing store password', async () => {
    await expect(
      sendForgotStorePasswordEmailService.execute({
        cnpj: '11111111111180',
        email: 'johndoe@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to recover using wrong cnpj', async () => {
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
      sendForgotStorePasswordEmailService.execute({
        cnpj: '11111111111179',
        email: 'johndoe@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to recover using wrong email', async () => {
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
      sendForgotStorePasswordEmailService.execute({
        cnpj: '11111111111180',
        email: 'wrong-email',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to recover using email from another user account', async () => {
    const userAccount1 = await createUserAccount.execute({
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
        accountUserId: userAccount1.id,
      },
      authenticatedUser.account.id,
    );

    const userAccount2 = await createUserAccount.execute({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johntre@example.com',
      password: 'PtPt2021*',
    });

    await expect(
      sendForgotStorePasswordEmailService.execute({
        cnpj: '11111111111180',
        email: userAccount2.email,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUserTokensRepository, 'generate');

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

    await sendForgotStorePasswordEmailService.execute({
      cnpj: '11111111111180',
      email: 'johndoe@example.com',
    });

    expect(generateToken).toHaveBeenCalledWith(storeAccount.id);
  });

  it('should be able to recover the password using the email and cnpj', async () => {
    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');

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

    await sendForgotStorePasswordEmailService.execute({
      cnpj: '11111111111180',
      email: 'johndoe@example.com',
    });

    expect(sendMail).toHaveBeenCalled();
  });
});
