import AppError from '@shared/errors/AppError';

import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeDocumentsRepository from '@modules/transactions/repositories/fakes/FakeDocumentsRepository';

import ShowProfileService from '@modules/accounts/services/ShowUserProfileService';

import CreateDepositsService from './CreateDepositsService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeCacheProvider: FakeCacheProvider;
let fakeDocumentsRepository: FakeDocumentsRepository;

let showProfile: ShowProfileService;

let createDeposit: CreateDepositsService;

describe('CreatePaymentSlipe', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeCacheProvider = new FakeCacheProvider();
    fakeDocumentsRepository = new FakeDocumentsRepository();

    showProfile = new ShowProfileService(
      fakeAccountsRepository,
      fakeCacheProvider,
    );

    createDeposit = new CreateDepositsService(
      fakeDocumentsRepository,
      fakeAccountsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to create a deposit', async () => {
    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const deposit = await createDeposit.execute({
      amount: 100,
      depositName: 'John Tre',
      gotoAccountId: userAccount.id,
    });

    const showedUserAccount = await showProfile.execute({
      account_id: userAccount.id,
    });

    expect(deposit).toHaveProperty('document');
    expect(deposit.type).toBe(3);
    expect(showedUserAccount.amount).toBe(100);
  });

  it('should not be able to create a deposit to non existing account', async () => {
    await expect(
      createDeposit.execute({
        amount: 100,
        depositName: 'John Tre',
        gotoAccountId: 'non-existing-account',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
