import { injectable, inject } from 'tsyringe';
import { isAfter, isBefore } from 'date-fns';
import reduce from 'awaity/reduce';

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
  initialAmountAccount: number;
  finalAmountAccount: number;
  document: IDocument[];
}

interface IAccumulator {
  initialAmount: number;
  finalAmountAccount: number;
  documentsOrganized: IDocument[];
}

@injectable()
class ListExtractsService {
  constructor(
    @inject('DocumentsRepository')
    private documentsRepository: IDocumentsRepository,

    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

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

    const allDocuments: Document[] = Array.prototype.concat(
      entriesDocuments,
      exitsDocuments,
    );

    allDocuments.sort((a: Document, b: Document) => {
      if (isBefore(a.paymentDate, b.paymentDate)) {
        return -1;
      }
      if (isAfter(a.paymentDate, b.paymentDate)) {
        return 1;
      }
      return 0;
    });

    const reversedSortedAllDocuments: IAccumulator = await reduce(
      allDocuments.reverse(),
      async (accumulator: IAccumulator, document: Document) => {
        if (document.fromAccountId === account.id) {
          accumulator.finalAmountAccount =
            Number(accumulator.finalAmountAccount) -
            Number(document.finalAmount);
          accumulator.initialAmount =
            Number(accumulator.initialAmount) + Number(document.finalAmount);

          const exitDocument = await this.accountsRepository
            .findById(document.gotoAccountId)
            .then(gotoAccount => {
              const response = {
                ...document,
                initialAmountAccount: accumulator.initialAmount,
                finalAmountAccount:
                  Number(accumulator.initialAmount) -
                  Number(document.finalAmount),
                finalAmount: Number(document.amount) * -1,
                fromAccountName: account.accountName,
                gotoAccountName: gotoAccount?.accountName,
              };

              return response;
            });

          accumulator.documentsOrganized.push(exitDocument);

          return accumulator;
        }

        if (document.gotoAccountId === account.id) {
          accumulator.finalAmountAccount =
            Number(accumulator.finalAmountAccount) +
            Number(document.finalAmount);
          accumulator.initialAmount =
            Number(accumulator.initialAmount) - Number(document.finalAmount);

          const entryDocument = await this.accountsRepository
            .findById(document.fromAccountId)
            .then(fromAccount => {
              const response = {
                ...document,
                initialAmountAccount: accumulator.initialAmount,
                finalAmountAccount:
                  Number(accumulator.initialAmount) +
                  Number(document.finalAmount),
                fromAccountName: fromAccount?.accountName,
                gotoAccountName: account.accountName,
              };

              return response;
            });

          accumulator.documentsOrganized.push(entryDocument);

          return accumulator;
        }

        accumulator.documentsOrganized.push();

        return accumulator;
      },
      {
        initialAmount: Number(account.amount),
        finalAmountAccount: 0,
        documentsOrganized: [] as IDocument[],
      },
    );

    reversedSortedAllDocuments.documentsOrganized.reverse();

    const extract = {
      accountId: account.id,
      accountName: account.accountName,
      initialDate: compareDate,
      initialAmountAccount: Number(reversedSortedAllDocuments.initialAmount),
      finalAmountAccount: reversedSortedAllDocuments.finalAmountAccount,
      document: reversedSortedAllDocuments.documentsOrganized,
    } as IResponse;

    return extract;
  }
}

export default ListExtractsService;
