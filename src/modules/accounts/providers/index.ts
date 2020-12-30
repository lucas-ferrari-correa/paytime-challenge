import { container } from 'tsyringe';

import IHashProvider from '@modules/accounts/providers/HashProvider/models/IHashProvider';
import BCryptHashProvider from '@modules/accounts/providers/HashProvider/implementations/BCryptHashProvider';

import ICpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/models/ICpfCnpjProvider';
import CpfCnpjProvider from '@modules/accounts/providers/CpfCnpjProvider/implementations/CpfCnpjProvider';

container.registerSingleton<IHashProvider>('HashProvider', BCryptHashProvider);

container.registerSingleton<ICpfCnpjProvider>(
  'CpfCnpjProvider',
  CpfCnpjProvider,
);
