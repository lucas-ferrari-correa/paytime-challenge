import { getRepository, Repository } from 'typeorm';

import IDocumentsRepository from '@modules/transactions/repositories/IDocumentsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';

import Document from '@modules/transactions/infra/typeorm/entities/Document';

class DocumentsRepository implements IDocumentsRepository {
  private ormRepository: Repository<Document>;

  constructor() {
    this.ormRepository = getRepository(Document);
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
