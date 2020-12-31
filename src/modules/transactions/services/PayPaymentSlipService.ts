import {
  isBefore,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

interface IRequest {
  id: string;
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

    const fromAccount = await this.accountsRepository.findById(documentData.id);

    const gotoAccount = await this.accountsRepository.findById(
      returnedDocument.gotoAccountId,
    );

    if (!fromAccount) {
      throw new AppError('This JWT token is invalid');
    }

    if (!gotoAccount) {
      throw new AppError('The destiny account does not exist');
    }

    if (fromAccount.amount < returnedDocument.finalAmount) {
      throw new AppError('Account does not have enough money to pay the slip');
    }

    const findDocument = {
      ...returnedDocument,
      gotoAccountName: gotoAccount.accountName,
    };

    if (isBefore(findDocument.dueDate, Date.now())) {
      const updatedDocument = {
        ...findDocument,
        fromAccountId: fromAccount.id,
        paymentStatus: 2,
      };

      await this.documentsRepository.save(updatedDocument);

      const updatedGotoAccount = {
        ...gotoAccount,
        amount:
          Number(gotoAccount.amount) + Number(updatedDocument.finalAmount),
      };

      await this.accountsRepository.save(updatedGotoAccount);

      const updatedFromAccount = {
        ...fromAccount,
        amount:
          Number(fromAccount.amount) - Number(updatedDocument.finalAmount),
      };

      await this.accountsRepository.save(updatedFromAccount);

      return updatedDocument;
    }

    const finalAmountPenalized =
      Number(findDocument.amount) + Number(findDocument.paymentPenalty);

    if (fromAccount.amount < finalAmountPenalized) {
      throw new AppError('Account does not have enough money to pay the slip');
    }

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

        if (fromAccount.amount < finalAmountPenalizedWithInterestInDays) {
          throw new AppError(
            'Account does not have enough money to pay the slip',
          );
        }

        const penalizedDocument = {
          ...findDocument,
          finalAmount: finalAmountPenalizedWithInterestInDays,
        };

        const updatedDocument = {
          ...penalizedDocument,
          fromAccountId: fromAccount.id,
          paymentStatus: 2,
        };

        await this.documentsRepository.save(updatedDocument);

        const updatedGotoAccount = {
          ...gotoAccount,
          amount:
            Number(gotoAccount.amount) + Number(updatedDocument.finalAmount),
        };

        await this.accountsRepository.save(updatedGotoAccount);

        const updatedFromAccount = {
          ...fromAccount,
          amount:
            Number(fromAccount.amount) - Number(updatedDocument.finalAmount),
        };

        await this.accountsRepository.save(updatedFromAccount);

        return updatedDocument;
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

        if (fromAccount.amount < finalAmountPenalizedWithInterestInMonths) {
          throw new AppError(
            'Account does not have enough money to pay the slip',
          );
        }

        const penalizedDocument = {
          ...findDocument,
          finalAmount: finalAmountPenalizedWithInterestInMonths,
        };

        const updatedDocument = {
          ...penalizedDocument,
          fromAccountId: fromAccount.id,
          paymentStatus: 2,
        };

        await this.documentsRepository.save(updatedDocument);

        const updatedGotoAccount = {
          ...gotoAccount,
          amount:
            Number(gotoAccount.amount) + Number(updatedDocument.finalAmount),
        };

        await this.accountsRepository.save(updatedGotoAccount);

        const updatedFromAccount = {
          ...fromAccount,
          amount:
            Number(fromAccount.amount) - Number(updatedDocument.finalAmount),
        };

        await this.accountsRepository.save(updatedFromAccount);

        return updatedDocument;
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

        if (fromAccount.amount < finalAmountPenalizedWithInterestInYears) {
          throw new AppError(
            'Account does not have enough money to pay the slip',
          );
        }

        const penalizedDocument = {
          ...findDocument,
          finalAmount: finalAmountPenalizedWithInterestInYears,
        };

        const updatedDocument = {
          ...penalizedDocument,
          fromAccountId: fromAccount.id,
          paymentStatus: 2,
        };

        await this.documentsRepository.save(updatedDocument);

        const updatedGotoAccount = {
          ...gotoAccount,
          amount:
            Number(gotoAccount.amount) + Number(updatedDocument.finalAmount),
        };

        await this.accountsRepository.save(updatedGotoAccount);

        const updatedFromAccount = {
          ...fromAccount,
          amount:
            Number(fromAccount.amount) - Number(updatedDocument.finalAmount),
        };

        await this.accountsRepository.save(updatedFromAccount);

        return updatedDocument;
      }
    }

    const penalizedDocument = {
      ...findDocument,
      finalAmount: finalAmountPenalized,
    };

    const updatedDocument = {
      ...penalizedDocument,
      fromAccountId: fromAccount.id,
      paymentStatus: 2,
    };

    await this.documentsRepository.save(updatedDocument);

    const updatedGotoAccount = {
      ...gotoAccount,
      amount: Number(gotoAccount.amount) + Number(updatedDocument.finalAmount),
    };

    await this.accountsRepository.save(updatedGotoAccount);

    const updatedFromAccount = {
      ...fromAccount,
      amount: Number(fromAccount.amount) - Number(updatedDocument.finalAmount),
    };

    await this.accountsRepository.save(updatedFromAccount);

    return updatedDocument;
  }
}

export default ShowPaymentSlipService;
