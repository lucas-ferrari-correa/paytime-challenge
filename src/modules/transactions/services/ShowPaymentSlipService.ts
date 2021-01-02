import {
  isBefore,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

interface IRequest {
  document: string;
}

@injectable()
class ShowPaymentSlipService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,
  ) {}

  public async execute(data: IRequest): Promise<Document> {
    const documentData = data;

    const returnedDocument = await this.documentsRepository.findByDocument(
      documentData.document,
    );

    if (!returnedDocument) {
      throw new AppError('This document does not exists');
    }

    if (returnedDocument.type !== 2) {
      throw new AppError('This document is not a payment slip');
    }

    const findAccount = await this.accountsRepository.findById(
      returnedDocument.gotoAccountId,
    );

    if (!findAccount) {
      throw new AppError('This destiny account does not exist');
    }

    const findDocument = {
      ...returnedDocument,
      gotoAccountName: findAccount.accountName,
    };

    const currentDate = new Date(Date.now());

    if (isBefore(currentDate, findDocument.dueDate)) {
      return findDocument;
    }

    let finalAmountPenalized =
      Number(findDocument.amount) + Number(findDocument.paymentPenalty);

    let penalizedTime = 0;

    if (findDocument.interest > 0) {
      if (findDocument.interestType === 1) {
        penalizedTime = differenceInDays(currentDate, findDocument.dueDate);
      }

      if (findDocument.interestType === 2) {
        penalizedTime = differenceInMonths(currentDate, findDocument.dueDate);
      }

      if (findDocument.interestType === 3) {
        penalizedTime = differenceInYears(currentDate, findDocument.dueDate);
      }

      finalAmountPenalized =
        Number(finalAmountPenalized) +
        penalizedTime *
          Number(findDocument.amount) *
          Number(findDocument.interest);
    }

    const penalizedDocument = {
      ...findDocument,
      finalAmount: finalAmountPenalized,
    };

    return penalizedDocument;
  }
}

export default ShowPaymentSlipService;
