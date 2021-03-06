export default interface ICreatePaymentSlipDTO {
  amount: number;
  dueDate: Date;
  paymentPenalty: number;
  interest: number;
  interestType: number;
  type: number;
  paymentStatus: number;
  finalAmount: number;
  gotoAccountId: string;
  paymentDate?: Date;
}
