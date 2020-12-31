import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

interface IRequest {
  amount: number;
  dueDate: Date;
  paymentPenalty: number;
  interest: number;
  interestType: number;
  gotoId: string;
}

@injectable()
class CreatePaymentSlipService {
  constructor(
    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,

    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  public async execute(data: IRequest): Promise<Document> {
    const accountData = data;

    const gotoAccount = await this.accountsRepository.findById(
      accountData.gotoId,
    );

    if (!gotoAccount) {
      throw new AppError('Invalid JWT Token');
    }

    if (
      accountData.interestType !== 1 &&
      accountData.interestType !== 2 &&
      accountData.interestType !== 3
    ) {
      throw new AppError(
        'Interest type needs to be 1 - Interest per day, 2 - Interest per month, 3 - Interest per year',
      );
    }

    if (accountData.interest < 0) {
      throw new AppError('Interest must be positive');
    }

    const document = await this.documentsRepository.createPaymentSlip({
      amount: accountData.amount,
      dueDate: accountData.dueDate,
      type: 2,
      paymentStatus: 1,
      paymentPenalty: accountData.paymentPenalty,
      interest: accountData.interest,
      interestType: accountData.interestType,
      finalAmount: accountData.amount,
      gotoAccountId: accountData.gotoId,
    });

    return document;
  }
}

export default CreatePaymentSlipService;
