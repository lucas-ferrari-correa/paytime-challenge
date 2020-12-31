import { getRepository, MoreThanOrEqual, Repository } from 'typeorm';

import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import ICreatePaymentSlipDTO from '@modules/transactions/dtos/ICreatePaymentSlipDTO';
import ICreateDepositDTO from '@modules/transactions/dtos/ICreateDepositDTO';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

class DocumentsRepository implements IDocumentsRepository {
  private ormRepository: Repository<Document>;

  constructor() {
    this.ormRepository = getRepository(Document);
  }

  public async findAllExitsByDate(
    date: Date,
    id: string,
  ): Promise<Document[] | undefined> {
    const exitDocuments = this.ormRepository.find({
      fromAccountId: id,
      updated_at: MoreThanOrEqual(date),
    });

    return exitDocuments;
  }

  public async findAllEntriesByDate(
    date: Date,
    id: string,
  ): Promise<Document[] | undefined> {
    const entryDocuments = this.ormRepository.find({
      gotoAccountId: id,
      updated_at: MoreThanOrEqual(date),
    });

    return entryDocuments;
  }

  public async createDeposit(
    documentData: ICreateDepositDTO,
  ): Promise<Document> {
    const document = this.ormRepository.create(documentData);

    await this.ormRepository.save(document);

    return document;
  }

  public async findByDocument(document: string): Promise<Document | undefined> {
    const findDocument = await this.ormRepository.findOne(document);

    return findDocument;
  }

  public async createPaymentSlip(
    documentData: ICreatePaymentSlipDTO,
  ): Promise<Document> {
    const document = this.ormRepository.create(documentData);

    await this.ormRepository.save(document);

    return document;
  }

  public async createTransaction(
    documentData: ICreateTransactionDTO,
  ): Promise<Document> {
    const document = this.ormRepository.create(documentData);

    await this.ormRepository.save(document);

    return document;
  }

  public async save(document: Document): Promise<Document> {
    return this.ormRepository.save(document);
  }
}

export default DocumentsRepository;
