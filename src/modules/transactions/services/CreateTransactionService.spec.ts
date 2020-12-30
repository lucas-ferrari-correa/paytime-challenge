import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';

import AuthenticateUserAccountService from '@modules/accounts/services/AuthenticateUserAccountService';

import CreateStoreAccountService from '@modules/accounts/services/CreateStoreAccountService';

import CreateTransactionService from './CreateTransactionService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;
let fakeDocumentsRepository: FakeDocumentsRepository;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createStoreAccount: CreateStoreAccountService;

let createTransaction: CreateTransactionService;

describe('CreateTransaction', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCpfCnpjProvider = new FakeCpfCnpjProvider();
    fakeCacheProvider = new FakeCacheProvider();
    fakeDocumentsRepository = new FakeDocumentsRepository();

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

    createTransaction = new CreateTransactionService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeHashProvider,
    );
  });

  it('should be able to create a transaction (user account to user account)', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johntre@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const transaction = await createTransaction.execute({
      gotoAccountId: userAccount2.id,
      amount: 100,
      fromId: userAccount1.id,
    });

    const updatedUserAccount1 = await fakeAccountsRepository.findById(
      userAccount1.id,
    );

    const updatedUserAccount2 = await fakeAccountsRepository.findById(
      userAccount2.id,
    );

    expect(transaction).toHaveProperty('document');
    expect(updatedUserAccount1?.amount).toBe(0);
    expect(updatedUserAccount2?.amount).toBe(100);
  });

  it('should be able to create a transaction (user account to store account)', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
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

    const transaction = await createTransaction.execute({
      gotoAccountId: storeAccount.id,
      amount: 100,
      fromId: userAccount.id,
    });

    const updatedUserAccount = await fakeAccountsRepository.findById(
      userAccount.id,
    );

    const updatedStoreAccount = await fakeAccountsRepository.findById(
      storeAccount.id,
    );

    expect(transaction).toHaveProperty('document');
    expect(updatedUserAccount?.amount).toBe(0);
    expect(updatedStoreAccount?.amount).toBe(100);
  });

  it('should be able to create a transaction (store account to store account)', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    const storeAccount1 = await fakeAccountsRepository.createStoreAccount({
      accountName: 'John Doe',
      cnpj: '11111111111180',
      password: 'PtPt2021*',
      accountUserId: userAccount.id,
      amount: 100,
    });

    const storeAccount2 = await fakeAccountsRepository.createStoreAccount({
      accountName: 'John Tre',
      cnpj: '22222222222259',
      password: 'PtPt2021*',
      accountUserId: userAccount.id,
      amount: 0,
    });

    const transaction = await createTransaction.execute({
      gotoAccountId: storeAccount2.id,
      amount: 100,
      fromId: storeAccount1.id,
    });

    const updatedStoreAccount1 = await fakeAccountsRepository.findById(
      storeAccount1.id,
    );

    const updatedStoreAccount2 = await fakeAccountsRepository.findById(
      storeAccount2.id,
    );

    expect(transaction).toHaveProperty('document');
    expect(updatedStoreAccount1?.amount).toBe(0);
    expect(updatedStoreAccount2?.amount).toBe(100);
  });

  it('should not be able to create a transaction from non existing account', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    await expect(
      createTransaction.execute({
        gotoAccountId: userAccount.id,
        amount: 100,
        fromId: 'non-existing-account',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a transaction to non existing account', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    await expect(
      createTransaction.execute({
        gotoAccountId: 'non-existing-account',
        amount: 100,
        fromId: userAccount.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a transaction with insufficient money', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 99,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johntre@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await expect(
      createTransaction.execute({
        gotoAccountId: userAccount2.id,
        amount: 100,
        fromId: userAccount1.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
