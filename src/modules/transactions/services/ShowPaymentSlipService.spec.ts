import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import CreateTransactionService from './CreateTransactionService';
import CreatePaymentSlipService from './CreatePaymentSlipService';
import ShowPaymentSlipService from './ShowPaymentSlipService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeCacheProvider: FakeCacheProvider;
let fakeDocumentsRepository: FakeDocumentsRepository;

let createTransaction: CreateTransactionService;
let createPaymentSlip: CreatePaymentSlipService;
let showPaymentSlip: ShowPaymentSlipService;

describe('ShowPaymentSlipe', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeCacheProvider = new FakeCacheProvider();
    fakeDocumentsRepository = new FakeDocumentsRepository();

    createPaymentSlip = new CreatePaymentSlipService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
    );

    showPaymentSlip = new ShowPaymentSlipService(
      fakeAccountsRepository,
      fakeDocumentsRepository,
    );

    createTransaction = new CreateTransactionService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeCacheProvider,
    );
  });

  it('should not be able to show a payment slip that does not exist', async () => {
    await expect(
      showPaymentSlip.execute({
        document: 'non-existing-document',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to show a document that is not a payment slip', async () => {
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
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    const transaction = await createTransaction.execute({
      gotoAccountId: userAccount1.id,
      amount: 100,
      fromId: userAccount2.id,
    });

    await expect(
      showPaymentSlip.execute({
        document: transaction.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to show a payment slip with daily interest', async () => {
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

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 0, 2).getTime();
    });

    const showedPaymentSlip = await showPaymentSlip.execute({
      document: paymentSlip.document,
    });

    expect(showedPaymentSlip).toHaveProperty('document');
    expect(showedPaymentSlip.paymentStatus).toBe(1);
    expect(showedPaymentSlip.interestType).toBe(1);
    expect(showedPaymentSlip.finalAmount).toBe(151);
  });

  it('should be able to show a payment slip with monthly interest', async () => {
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
      interestType: 2,
      gotoId: userAccount.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 1, 2).getTime();
    });

    const showedPaymentSlip = await showPaymentSlip.execute({
      document: paymentSlip.document,
    });

    expect(showedPaymentSlip).toHaveProperty('document');
    expect(showedPaymentSlip.paymentStatus).toBe(1);
    expect(showedPaymentSlip.interestType).toBe(2);
    expect(showedPaymentSlip.finalAmount).toBe(151);
  });

  it('should be able to show a payment slip with annually interest', async () => {
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
      interestType: 3,
      gotoId: userAccount.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2022, 0, 2).getTime();
    });

    const showedPaymentSlip = await showPaymentSlip.execute({
      document: paymentSlip.document,
    });

    expect(showedPaymentSlip).toHaveProperty('document');
    expect(showedPaymentSlip.paymentStatus).toBe(1);
    expect(showedPaymentSlip.interestType).toBe(3);
    expect(showedPaymentSlip.finalAmount).toBe(151);
  });

  it('should be able to show a payment slip', async () => {
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

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 1).getTime();
    });

    const showedPaymentSlip = await showPaymentSlip.execute({
      document: paymentSlip.document,
    });

    expect(showedPaymentSlip).toHaveProperty('document');
  });
});
