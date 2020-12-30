import Document from '@modules/transactions/infra/typeorm/entities/Document';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';

export default interface IDocumentsRepository {
  createTransaction(data: ICreateTransactionDTO): Promise<Document>;
  save(document: Document): Promise<Document>;
}
