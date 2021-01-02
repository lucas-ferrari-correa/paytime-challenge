import AppError from '@shared/errors/AppError';

import FakeHashProvider from '@modules/accounts/providers/HashProvider/fakes/FakeHashProvider';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import UpdateUserProfileService from './UpdateUserProfileService';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeCacheProvider: FakeCacheProvider;
let fakeHashProvider: FakeHashProvider;
let updateUserProfile: UpdateUserProfileService;

describe('UpdateUserProfile', () => {
  beforeEach(() => {
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeCacheProvider = new FakeCacheProvider();
    updateUserProfile = new UpdateUserProfileService(
      fakeAccountsRepository,
      fakeHashProvider,
      fakeCacheProvider,
    );
  });

  it('should be able to update the profile', async () => {
    const accountUser = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const updatedUser = await updateUserProfile.execute({
      account_user_id: accountUser.id,
      accountName: 'John Tre',
      cpf: '22222222222',
      email: 'johntre@example.com',
    });

    expect(updatedUser.accountName).toBe('John Tre');
    expect(updatedUser.email).toBe('johntre@example.com');
  });

  it('should not be able to update the profile from non-existing user', async () => {
    expect(
      updateUserProfile.execute({
        account_user_id: 'non-existing-user-id',
        accountName: 'Test',
        cpf: '22222222222',
        email: 'test@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to change to another user email', async () => {
    await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'Test',
      cpf: '22222222222',
      email: 'test@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await expect(
      updateUserProfile.execute({
        account_user_id: userAccount.id,
        accountName: 'Test',
        cpf: '22222222222',
        email: 'johndoe@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to change to another user cpf', async () => {
    await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const userAccount = await fakeAccountsRepository.createUserAccount({
      accountName: 'Test',
      cpf: '22222222222',
      email: 'test@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await expect(
      updateUserProfile.execute({
        account_user_id: userAccount.id,
        accountName: 'Test',
        cpf: '11111111111',
        email: 'test@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update the password', async () => {
    const user = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    const updatedUser = await updateUserProfile.execute({
      account_user_id: user.id,
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      old_password: 'PtPt2021*',
      password: 'PtPt2022*',
    });

    expect(updatedUser.password).toBe('PtPt2022*');
  });

  it('should not be able to update the password without old password', async () => {
    const user = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await expect(
      updateUserProfile.execute({
        account_user_id: user.id,
        accountName: 'John Tre',
        cpf: '11111111111',
        email: 'johntre@example.com',
        password: 'PtPt2022*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to update the password without wrong old password', async () => {
    const user = await fakeAccountsRepository.createUserAccount({
      accountName: 'John Doe',
      cpf: '11111111111',
      email: 'johndoe@example.com',
      password: 'PtPt2021*',
      amount: 0,
    });

    await expect(
      updateUserProfile.execute({
        account_user_id: user.id,
        accountName: 'John Tre',
        cpf: '11111111111',
        email: 'johntre@example.com',
        old_password: 'wrong-old-password',
        password: 'PtPt2022*',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
