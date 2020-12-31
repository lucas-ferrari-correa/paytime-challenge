import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';

import CreateTransactionService from './CreateTransactionService';
import CreatePaymentSlipService from './CreatePaymentSlipService';
import ShowPaymentSlipService from './ShowPaymentSlipService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeHashProvider: FakeHashProvider;
let fakeDocumentsRepository: FakeDocumentsRepository;

let createTransaction: CreateTransactionService;
let createPaymentSlip: CreatePaymentSlipService;
let showPaymentSlip: ShowPaymentSlipService;

describe('ShowPaymentSlipe', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeDocumentsRepository = new FakeDocumentsRepository();

    createPaymentSlip = new CreatePaymentSlipService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeHashProvider,
    );

    showPaymentSlip = new ShowPaymentSlipService(fakeDocumentsRepository);

    createTransaction = new CreateTransactionService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeHashProvider,
    );
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

    const showedPaymentSlip = await showPaymentSlip.execute({
      document: paymentSlip.document,
    });

    expect(showedPaymentSlip).toHaveProperty('document');
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
});
