import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

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
  ) {}

  public async execute(data: IRequest): Promise<Document> {
    const documentData = data;

    const fromAccount = await this.accountsRepository.findById(
      documentData.fromId,
    );

    if (!fromAccount) {
      throw new AppError('Invalid JWT Token');
    }

    if (fromAccount.amount < documentData.amount) {
      throw new AppError('Account does not have enough money to transaction');
    }

    const gotoAccount = await this.accountsRepository.findById(
      documentData.gotoAccountId,
    );

    if (!gotoAccount) {
      throw new AppError('The destiny account does not exists');
    }

    const document = await this.documentsRepository.createTransaction({
      gotoAccountId: gotoAccount.id,
      fromAccountId: fromAccount.id,
      amount: documentData.amount,
      type: 1,
      paymentStatus: 1,
      dueDate: new Date(),
      finalAmount: documentData.amount,
    });

    const updatedAmountFromAccount = {
      ...fromAccount,
      amount: Number(fromAccount.amount) - Number(documentData.amount),
    };

    const updatedAmountGotoAccount = {
      ...gotoAccount,
      amount: Number(gotoAccount.amount) + Number(documentData.amount),
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
