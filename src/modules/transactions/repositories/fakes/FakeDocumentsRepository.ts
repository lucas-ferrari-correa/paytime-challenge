import { uuid } from 'uuidv4';

import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import ICreatePaymentSlipDTO from '@modules/transactions/dtos/ICreatePaymentSlipDTO';
import ICreateDepositDTO from '@modules/transactions/dtos/ICreateDepositDTO';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

class FakeDocumentsRepository implements IDocumentsRepository {
  private documents: Document[] = [];

  public async createDeposit(
    documentData: ICreateDepositDTO,
  ): Promise<Document> {
    const document = new Document();

    Object.assign(document, { document: uuid() }, documentData);

    this.documents.push(document);

    return document;
  }

  public async findByDocument(document: string): Promise<Document | undefined> {
    const findDocument = this.documents.find(
      oneDocument => oneDocument.document === document,
    );

    return findDocument;
  }

  public async createPaymentSlip(
    documentData: ICreatePaymentSlipDTO,
  ): Promise<Document> {
    const document = new Document();

    Object.assign(document, { document: uuid() }, documentData);

    this.documents.push(document);

    return document;
  }

  public async createTransaction(
    documentData: ICreateTransactionDTO,
  ): Promise<Document> {
    const document = new Document();

    Object.assign(document, { document: uuid() }, documentData);

    this.documents.push(document);

    return document;
  }

  public async save(document: Document): Promise<Document> {
    const findIndex = this.documents.findIndex(
      findDocument => findDocument.document === document.document,
    );

    this.documents[findIndex] = document;

    return document;
  }
}

export default FakeDocumentsRepository;
