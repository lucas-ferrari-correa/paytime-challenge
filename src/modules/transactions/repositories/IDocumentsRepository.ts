import Document from '@modules/transactions/infra/typeorm/entities/Document';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import ICreatePaymentSlipDTO from '@modules/transactions/dtos/ICreatePaymentSlipDTO';

export default interface IDocumentsRepository {
  findByDocument(document: string): Promise<Document | undefined>;
  createPaymentSlip(data: ICreatePaymentSlipDTO): Promise<Document>;
  createTransaction(data: ICreateTransactionDTO): Promise<Document>;
  save(document: Document): Promise<Document>;
}
