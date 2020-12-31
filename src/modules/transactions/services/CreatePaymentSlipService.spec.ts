import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeCpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/fakes/FakeCpfCnpjProvider';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';

import AuthenticateUserAccountService from '@modules/accounts/services/AuthenticateUserAccountService';

import CreateStoreAccountService from '@modules/accounts/services/CreateStoreAccountService';

import CreatePaymentSlipService from './CreatePaymentSlipService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCpfCnpjProvider: FakeCpfCnpjProvider;
let fakeCacheProvider: FakeCacheProvider;
let fakeDocumentsRepository: FakeDocumentsRepository;

let authenticateUserAccountService: AuthenticateUserAccountService;

let createStoreAccount: CreateStoreAccountService;

let createPaymentSlip: CreatePaymentSlipService;

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

    createPaymentSlip = new CreatePaymentSlipService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeHashProvider,
    );
  });

  it('should be able to create a payment slip (user account)', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 0, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount.id,
    });

    expect(paymentSlip).toHaveProperty('document');
  });

  it('should be able to create a payment slip (store account)', async () => {
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

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 0, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: storeAccount.id,
    });

    expect(paymentSlip).toHaveProperty('document');
  });

  it('should not be able to create a transaction from non existing account', async () => {
    await expect(
      createPaymentSlip.execute({
        amount: 100,
        dueDate: new Date(2021, 0, 1),
        paymentPenalty: 50,
        interest: 0.01,
        interestType: 1,
        gotoId: 'non-existing-account',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a transaction with wrong interest type', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 99,
    });

    await expect(
      createPaymentSlip.execute({
        amount: 100,
        dueDate: new Date(2021, 0, 1),
        paymentPenalty: 50,
        interest: 0.01,
        interestType: 4,
        gotoId: userAccount.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
