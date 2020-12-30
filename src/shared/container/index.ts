import { container } from 'tsyringe';

import '@modules/accounts/providers';
import '@shared/container/providers';

import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';

container.registerSingleton<IAccountsRepository>(
  'AccountsRepository',
  AccountsRepository,
);
