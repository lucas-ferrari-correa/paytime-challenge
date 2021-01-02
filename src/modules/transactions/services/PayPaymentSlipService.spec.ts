import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import ShowProfileService from '@modules/accounts/services/ShowUserProfileService';
import CreateTransactionService from './CreateTransactionService';
import CreatePaymentSlipService from './CreatePaymentSlipService';
import PayPaymentSlipService from './PayPaymentSlipService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeDocumentsRepository: FakeDocumentsRepository;
let fakeCacheProvider: FakeCacheProvider;

let showProfile: ShowProfileService;
let createTransaction: CreateTransactionService;
let createPaymentSlip: CreatePaymentSlipService;
let payPaymentSlip: PayPaymentSlipService;

describe('ShowPaymentSlipe', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeCacheProvider = new FakeCacheProvider();
    fakeDocumentsRepository = new FakeDocumentsRepository();

    createPaymentSlip = new CreatePaymentSlipService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
    );

    payPaymentSlip = new PayPaymentSlipService(
      fakeAccountsRepository,
      fakeDocumentsRepository,
      fakeCacheProvider,
    );

    createTransaction = new CreateTransactionService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeCacheProvider,
    );

    showProfile = new ShowProfileService(
      fakeAccountsRepository,
      fakeCacheProvider,
    );
  });

  it('should not be able to pay a payment slip that does not exist', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount.id,
        document: 'non-existing-document',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to pay a payment slip that is not a payment slip', async () => {
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
      payPaymentSlip.execute({
        id: userAccount2.id,
        document: transaction.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to pay a payment slip without enough money', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 101,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount1.id,
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount2.id,
        document: paymentSlip.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to pay a payment slip for yourself', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 101,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount.id,
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount.id,
        document: paymentSlip.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to pay a payment slip that is already payed', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 200,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount1.id,
    });

    const payedPaymentSlip = await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount2.id,
        document: payedPaymentSlip.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to pay a payment slip before the due date', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 100,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2020, 11, 6),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 5).getTime();
    });

    const payedPaymentSlip = await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    const showedUserAccount1 = await showProfile.execute({
      account_id: userAccount1.id,
    });

    const showedUserAccount2 = await showProfile.execute({
      account_id: userAccount2.id,
    });

    expect(payedPaymentSlip).toHaveProperty('document');
    expect(payedPaymentSlip.paymentStatus).toBe(2);
    expect(payedPaymentSlip.finalAmount).toBe(100);
    expect(showedUserAccount2.amount).toBe(0);
    expect(showedUserAccount1.amount).toBe(100);
  });

  it('should be able to pay a payment slip with daily interest', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 151,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 5, 2).getTime();
    });

    const payedPaymentSlip = await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    const showedUserAccount1 = await showProfile.execute({
      account_id: userAccount1.id,
    });

    const showedUserAccount2 = await showProfile.execute({
      account_id: userAccount2.id,
    });

    expect(payedPaymentSlip).toHaveProperty('document');
    expect(payedPaymentSlip.paymentStatus).toBe(2);
    expect(payedPaymentSlip.interestType).toBe(1);
    expect(payedPaymentSlip.finalAmount).toBe(151);
    expect(showedUserAccount2.amount).toBe(0);
    expect(showedUserAccount1.amount).toBe(151);
  });

  it('should not be able to pay a payment slip without enough money (daily interest)', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 150,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 5, 2).getTime();
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount2.id,
        document: paymentSlip.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to pay a payment slip with monthly interest', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 151,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 2,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 6, 2).getTime();
    });

    const payedPaymentSlip = await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    const showedUserAccount1 = await showProfile.execute({
      account_id: userAccount1.id,
    });

    const showedUserAccount2 = await showProfile.execute({
      account_id: userAccount2.id,
    });

    expect(payedPaymentSlip).toHaveProperty('document');
    expect(payedPaymentSlip.paymentStatus).toBe(2);
    expect(payedPaymentSlip.interestType).toBe(2);
    expect(payedPaymentSlip.finalAmount).toBe(151);
    expect(showedUserAccount2.amount).toBe(0);
    expect(showedUserAccount1.amount).toBe(151);
  });

  it('should not be able to pay a payment slip without enough money (monthly interest)', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 150,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 2,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 6, 2).getTime();
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount2.id,
        document: paymentSlip.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to pay a payment slip with annually interest', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 151,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 3,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2022, 5, 2).getTime();
    });

    const payedPaymentSlip = await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    const showedUserAccount1 = await showProfile.execute({
      account_id: userAccount1.id,
    });

    const showedUserAccount2 = await showProfile.execute({
      account_id: userAccount2.id,
    });

    expect(payedPaymentSlip).toHaveProperty('document');
    expect(payedPaymentSlip.paymentStatus).toBe(2);
    expect(payedPaymentSlip.interestType).toBe(3);
    expect(payedPaymentSlip.finalAmount).toBe(151);
    expect(showedUserAccount2.amount).toBe(0);
    expect(showedUserAccount1.amount).toBe(151);
  });

  it('should not be able to pay a payment slip without enough money (annually interest)', async () => {
    const userAccount1 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount2 = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 150,
    });

    const paymentSlip = await createPaymentSlip.execute({
      amount: 100,
      dueDate: new Date(2021, 5, 1),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 2,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2022, 5, 2).getTime();
    });

    await expect(
      payPaymentSlip.execute({
        id: userAccount2.id,
        document: paymentSlip.document,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
