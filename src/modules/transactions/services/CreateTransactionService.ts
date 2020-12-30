import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IHashProvider from '@modules/transactions/providers/HashProvider/implementations/BCryptHashProvider';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

interface IRequest {
  gotoAccountId: string;
  amount: number;
  fromId: string;
}

@injectable()
class CreateTransactionService {
  constructor(
    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,

    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute(data: IRequest): Promise<Document> {
    const accountData = data;

    const fromAccount = await this.accountsRepository.findById(
      accountData.fromId,
    );

    if (!fromAccount) {
      throw new AppError('Invalid JWT Token');
    }

    if (fromAccount.amount < accountData.amount) {
      throw new AppError('Account does not have enough money to transaction');
    }

    const gotoAccount = await this.accountsRepository.findById(
      accountData.gotoAccountId,
    );

    if (!gotoAccount) {
      throw new AppError('The destiny account does not exists');
    }

    const hashedFromAccountId = await this.hashProvider.generateHash(
      accountData.fromId,
    );

    const hashedGotoAccountId = await this.hashProvider.generateHash(
      accountData.gotoAccountId,
    );

    const document = await this.documentsRepository.createTransaction({
      gotoAccountId: hashedGotoAccountId,
      fromAccountId: hashedFromAccountId,
      amount: accountData.amount,
      type: 1,
      paymentStatus: 1,
      dueDate: new Date(),
      finalAmount: accountData.amount,
    });

    const updatedAmountFromAccount = {
      ...fromAccount,
      amount: fromAccount.amount - accountData.amount,
    };

    const updatedAmountGotoAccount = {
      ...gotoAccount,
      amount: gotoAccount.amount + accountData.amount,
    };

    await this.accountsRepository.save(updatedAmountFromAccount);

    await this.accountsRepository.save(updatedAmountGotoAccount);

    const payedDocument = {
      ...document,
      paymentStatus: 2,
    };

    await this.documentsRepository.save(payedDocument);

    return document;
  }
}

export default CreateTransactionService;
