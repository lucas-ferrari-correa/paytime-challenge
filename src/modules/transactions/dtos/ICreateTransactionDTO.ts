export default interface ICreateTransactionDTO {
  gotoAccountId: string;
  fromAccountId: string;
  amount: number;
  type: number;
  paymentStatus: number;
  dueDate: Date;
  finalAmount: number;
}
