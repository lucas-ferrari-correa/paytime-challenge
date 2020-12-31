import { injectable, inject } from 'tsyringe';
import { isAfter, isBefore } from 'date-fns';

import AppError from '@shared/errors/AppError';
import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

interface IRequest {
  initialDateDay: number;
  initialDateMonth: number;
  initialDateYear: number;
  id: string;
}

interface IDocument extends Document {
  initialAmountAccount: number;
  fromAccountName?: string;
  gotoAccountName?: string;
  finalAmountAccount: number;
}

interface IResponse {
  accountId: string;
  accountName: string;
  initialDate: Date;
  initialAmount: number;
  document: IDocument[];
}

@injectable()
class ListExtractsService {
  constructor(
    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,

    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  compare(a: Document, b: Document): number {
    if (isBefore(a.updated_at, b.updated_at)) {
      return -1;
    }
    if (isAfter(a.updated_at, b.updated_at)) {
      return 1;
    }
    return 0;
  }

  public async execute(data: IRequest): Promise<IResponse> {
    const exctractData = data;

    const account = await this.accountsRepository.findById(exctractData.id);

    if (!account) {
      throw new AppError('Invalid JWT Token');
    }

    const compareDate = new Date(
      exctractData.initialDateYear,
      exctractData.initialDateMonth - 1,
      exctractData.initialDateDay,
    );

    const entriesDocuments = await this.documentsRepository.findAllEntriesByDate(
      compareDate,
      account.id,
    );

    const exitsDocuments = await this.documentsRepository.findAllExitsByDate(
      compareDate,
      account.id,
    );

    const allDocuments: Document[] = [];

    if (entriesDocuments) {
      allDocuments.concat(entriesDocuments);
    }

    if (exitsDocuments) {
      allDocuments.concat(exitsDocuments);
    }

    allDocuments.sort(this.compare);

    let initialAmount = account.amount;
    let finalAmountAccount = 0;

    const reversedSortedAllDocuments = allDocuments
      .reverse()
      .map(async document => {
        if (document.fromAccountId === account.id) {
          finalAmountAccount = initialAmount;
          initialAmount += document.finalAmount;

          const exitDocument = await this.accountsRepository
            .findById(document.gotoAccountId)
            .then(gotoAccount => {
              const response = {
                ...document,
                initialAmountAccount: initialAmount,
                finalAmountAccount,
                amount: Number(document.amount) * -1,
                fromAccountName: account.accountName,
                gotoAccountName: gotoAccount?.accountName,
              };

              return response;
            });

          return exitDocument;
        }

        if (document.gotoAccountId === account.id) {
          finalAmountAccount = initialAmount;
          initialAmount -= document.finalAmount;

          const entryDocument = await this.accountsRepository
            .findById(document.fromAccountId)
            .then(fromAccount => {
              const response = {
                ...document,
                initialAmountAccount: initialAmount,
                finalAmountAccount,
                fromAccountName: fromAccount?.accountName,
                gotoAccountName: account.accountName,
              };

              return response;
            });

          return entryDocument;
        }

        const otherDocument = {
          ...document,
          initialAmountAccount: 0,
          finalAmountAccount: 0,
          fromAccountName: '',
          gotoAccountName: '',
        };

        return otherDocument;
      });

    const reversedSortedAllDocumentsResolved = await Promise.all(
      reversedSortedAllDocuments,
    ).then(result => {
      return result;
    });

    reversedSortedAllDocumentsResolved.reverse();

    const extract = {
      accountId: account.id,
      accountName: account.accountName,
      initialDate: compareDate,
      initialAmount,
      document: reversedSortedAllDocumentsResolved,
    };

    return extract;
  }
}

export default ListExtractsService;
