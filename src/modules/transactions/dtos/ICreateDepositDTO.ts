export default interface ICreateDepositDTO {
  gotoAccountId: string;
  fromName: string;
  amount: number;
  type: number;
  paymentStatus: number;
  dueDate: Date;
  finalAmount: number;
}
