import { container } from 'tsyringe';

import '@modules/accounts/providers';
import '@shared/container/providers';

import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';

import IAccountTokensRepository from '@modules/accounts/repositories/IAccountTokensRepository';
import AccountTokensRepository from '@modules/accounts/infra/typeorm/repositories/AccountTokensRepository';

import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import DocumentsRepository from '@modules/transactions/infra/typeorm/repositories/DocumentsRepository';

container.registerSingleton<IAccountsRepository>(
  'AccountsRepository',
  AccountsRepository,
);

container.registerSingleton<IAccountTokensRepository>(
  'AccountTokensRepository',
  AccountTokensRepository,
);

container.registerSingleton<IDocumentsRepository>(
  'DocumentsRepository',
  DocumentsRepository,
);
