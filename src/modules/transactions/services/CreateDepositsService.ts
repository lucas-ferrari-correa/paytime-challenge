import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import Document from '@modules/transactions/infra/typeorm/entities/Document';
import { classToClass } from 'class-transformer';

interface IRequest {
  gotoAccountId: string;
  depositName: string;
  amount: number;
}

@injectable()
class CreateDepositsService {
  constructor(
    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,

    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute(data: IRequest): Promise<Document> {
    const documentData = data;

    const gotoAccount = await this.accountsRepository.findById(
      documentData.gotoAccountId,
    );

    if (!gotoAccount) {
      throw new AppError('The destiny account does not exists');
    }

    const document = await this.documentsRepository.createDeposit({
      gotoAccountId: gotoAccount.id,
      depositName: documentData.depositName,
      amount: documentData.amount,
      type: 3,
      paymentStatus: 1,
      dueDate: new Date(),
      finalAmount: documentData.amount,
    });

    const updatedAmountGotoAccount = {
      ...gotoAccount,
      amount: Number(gotoAccount.amount) + Number(documentData.amount),
    };

    await this.accountsRepository.save(updatedAmountGotoAccount);

    const payedDocument = {
      ...document,
      paymentStatus: 2,
      paymentDate: new Date(),
    };

    await this.documentsRepository.save(payedDocument);

    if (updatedAmountGotoAccount.cnpj) {
      await this.cacheProvider.save(
        `stores-list:${updatedAmountGotoAccount.id}:*`,
        classToClass(updatedAmountGotoAccount),
      );
    }

    if (updatedAmountGotoAccount.cpf) {
      await this.cacheProvider.save(
        `users-list:${updatedAmountGotoAccount.id}`,
        classToClass(updatedAmountGotoAccount),
      );
    }

    return document;
  }
}

export default CreateDepositsService;
