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
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import Document from '@modules/transactions/infra/typeorm/entities/Document';
import { classToClass } from 'class-transformer';

interface IRequest {
  id: string;
  document: string;
}

@injectable()
class PayPaymentSlipService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,

    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
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

    if (returnedDocument.paymentStatus !== 1) {
      throw new AppError('This slip is already payed');
    }

    if (returnedDocument.gotoAccountId === documentData.id) {
      throw new AppError('You can not pay a slip for yourself');
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

    const currentDate = new Date(Date.now());

    if (isBefore(currentDate, findDocument.dueDate)) {
      const updatedDocument = {
        ...findDocument,
        fromAccountId: fromAccount.id,
        paymentStatus: 2,
        paymentDate: currentDate,
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

      if (updatedFromAccount.cnpj) {
        await this.cacheProvider.save(
          `stores-list:${updatedFromAccount.id}:*`,
          classToClass(updatedFromAccount),
        );
      }

      if (updatedFromAccount.cpf) {
        await this.cacheProvider.save(
          `users-list:${updatedFromAccount.id}`,
          classToClass(updatedFromAccount),
        );
      }

      if (updatedGotoAccount.cnpj) {
        await this.cacheProvider.save(
          `stores-list:${updatedGotoAccount.id}:*`,
          classToClass(updatedGotoAccount),
        );
      }

      if (updatedGotoAccount.cpf) {
        await this.cacheProvider.save(
          `users-list:${updatedGotoAccount.id}`,
          classToClass(updatedGotoAccount),
        );
      }

      return updatedDocument;
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

      if (fromAccount.amount < finalAmountPenalized) {
        throw new AppError(
          'Account does not have enough money to pay the slip',
        );
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
      paymentDate: currentDate,
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

    if (updatedFromAccount.cnpj) {
      await this.cacheProvider.save(
        `stores-list:${updatedFromAccount.id}:*`,
        classToClass(updatedFromAccount),
      );
    }

    if (updatedFromAccount.cpf) {
      await this.cacheProvider.save(
        `users-list:${updatedFromAccount.id}`,
        classToClass(updatedFromAccount),
      );
    }

    if (updatedGotoAccount.cnpj) {
      await this.cacheProvider.save(
        `stores-list:${updatedGotoAccount.id}:*`,
        classToClass(updatedGotoAccount),
      );
    }

    if (updatedGotoAccount.cpf) {
      await this.cacheProvider.save(
        `users-list:${updatedGotoAccount.id}`,
        classToClass(updatedGotoAccount),
      );
    }

    return updatedDocument;
  }
}

export default PayPaymentSlipService;
