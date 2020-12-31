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

    if (isBefore(findDocument.dueDate, Date.now())) {
      return findDocument;
    }

    const finalAmountPenalized =
      Number(findDocument.amount) + Number(findDocument.paymentPenalty);

    if (findDocument.interest > 0) {
      const finalAmountPenalizedWithInterest = finalAmountPenalized;

      if (findDocument.interest === 1) {
        const currentDate = new Date(Date.now());

        const penalizedDays = differenceInDays(
          currentDate,
          findDocument.dueDate,
        );

        const finalAmountPenalizedWithInterestInDays =
          Number(finalAmountPenalizedWithInterest) +
          penalizedDays *
            Number(findDocument.amount) *
            Number(findDocument.interest);

        const penalizedDocument = {
          ...findDocument,
          finalAmount: finalAmountPenalizedWithInterestInDays,
        };

        return penalizedDocument;
      }

      if (findDocument.interest === 2) {
        const currentDate = new Date(Date.now());

        const penalizedMonths = differenceInMonths(
          currentDate,
          findDocument.dueDate,
        );

        const finalAmountPenalizedWithInterestInMonths =
          Number(finalAmountPenalizedWithInterest) +
          penalizedMonths *
            Number(findDocument.amount) *
            Number(findDocument.interest);

        const penalizedDocument = {
          ...findDocument,
          finalAmount: finalAmountPenalizedWithInterestInMonths,
        };

        return penalizedDocument;
      }

      if (findDocument.interest === 3) {
        const currentDate = new Date(Date.now());

        const penalizedYears = differenceInYears(
          currentDate,
          findDocument.dueDate,
        );

        const finalAmountPenalizedWithInterestInYears =
          Number(finalAmountPenalizedWithInterest) +
          penalizedYears *
            Number(findDocument.amount) *
            Number(findDocument.interest);

        const penalizedDocument = {
          ...findDocument,
          finalAmount: finalAmountPenalizedWithInterestInYears,
        };

        return penalizedDocument;
      }
    }

    const penalizedDocument = {
      ...findDocument,
      finalAmount: finalAmountPenalized,
    };

    return penalizedDocument;
  }
}

export default ShowPaymentSlipService;
