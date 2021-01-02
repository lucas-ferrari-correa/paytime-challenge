export default interface ICreateDepositDTO {
  gotoAccountId: string;
  depositName: string;
  amount: number;
  type: number;
  paymentStatus: number;
  dueDate: Date;
  finalAmount: number;
  paymentDate?: Date;
}
