import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import CreateTransactionService from './CreateTransactionService';
import CreatePaymentSlipService from './CreatePaymentSlipService';
import PayPaymentSlipService from './PayPaymentSlipService';
import CreateDepositsService from './CreateDepositsService';
import ListExtractsService from './ListExtractsService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeDocumentsRepository: FakeDocumentsRepository;
let fakeCacheProvider: FakeCacheProvider;

let createTransaction: CreateTransactionService;
let createPaymentSlip: CreatePaymentSlipService;
let payPaymentSlip: PayPaymentSlipService;
let createDeposits: CreateDepositsService;
let listExtracts: ListExtractsService;

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

    createDeposits = new CreateDepositsService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeCacheProvider,
    );

    listExtracts = new ListExtractsService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
    );
  });

  it('should be able to list the detailed extract of an account (using 3 entries)', async () => {
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

    await createDeposits.execute({
      amount: 100,
      depositName: 'John Fou',
      gotoAccountId: userAccount1.id,
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

    await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    await createTransaction.execute({
      amount: 100,
      fromId: userAccount2.id,
      gotoAccountId: userAccount1.id,
    });

    const listExtractsAccount = await listExtracts.execute({
      id: userAccount1.id,
      initialDateDay: 1,
      initialDateMonth: 12,
      initialDateYear: 2020,
    });

    expect(listExtractsAccount.accountId).toBe(userAccount1.id);
    expect(listExtractsAccount.initialAmountAccount).toBe(0);
    expect(listExtractsAccount.finalAmountAccount).toBe(300);

    expect(listExtractsAccount.document[0].initialAmountAccount).toBe(0);
    expect(listExtractsAccount.document[0].finalAmountAccount).toBe(100);
    expect(listExtractsAccount.document[1].initialAmountAccount).toBe(100);
    expect(listExtractsAccount.document[1].finalAmountAccount).toBe(200);
    expect(listExtractsAccount.document[2].initialAmountAccount).toBe(200);
    expect(listExtractsAccount.document[2].finalAmountAccount).toBe(300);
  });

  it('should be able to list the detailed extract of an account (using 3 entries and 1 exit)', async () => {
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
      dueDate: new Date(2020, 11, 6),
      paymentPenalty: 50,
      interest: 0.01,
      interestType: 1,
      gotoId: userAccount1.id,
    });

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 5).getTime();
    });

    await payPaymentSlip.execute({
      id: userAccount2.id,
      document: paymentSlip.document,
    });

    await createDeposits.execute({
      amount: 100,
      depositName: 'John Fou',
      gotoAccountId: userAccount1.id,
    });

    await createTransaction.execute({
      amount: 100,
      fromId: userAccount2.id,
      gotoAccountId: userAccount1.id,
    });

    await createTransaction.execute({
      amount: 200,
      fromId: userAccount1.id,
      gotoAccountId: userAccount2.id,
    });

    const listExtractsAccount = await listExtracts.execute({
      id: userAccount1.id,
      initialDateDay: 1,
      initialDateMonth: 12,
      initialDateYear: 2020,
    });

    expect(listExtractsAccount.accountId).toBe(userAccount1.id);
    expect(listExtractsAccount.initialAmountAccount).toBe(0);
    expect(listExtractsAccount.finalAmountAccount).toBe(100);

    expect(listExtractsAccount.document[0].initialAmountAccount).toBe(0);
    expect(listExtractsAccount.document[0].finalAmountAccount).toBe(100);
    expect(listExtractsAccount.document[1].initialAmountAccount).toBe(100);
    expect(listExtractsAccount.document[1].finalAmountAccount).toBe(200);
    expect(listExtractsAccount.document[2].initialAmountAccount).toBe(200);
    expect(listExtractsAccount.document[2].finalAmountAccount).toBe(300);
    expect(listExtractsAccount.document[3].initialAmountAccount).toBe(300);
    expect(listExtractsAccount.document[3].finalAmountAccount).toBe(100);
  });

  it('should not be able to list a extract with a invalid account', async () => {
    await expect(
      listExtracts.execute({
        id: 'non-existing-account',
        initialDateDay: 1,
        initialDateMonth: 12,
        initialDateYear: 2020,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
