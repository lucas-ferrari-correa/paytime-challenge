import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreatePaymentSlipService from '@modules/transactions/services/CreatePaymentSlipService';
import ShowPaymentSlipService from '@modules/transactions/services/ShowPaymentSlipService';
import PayPaymentSlipService from '@modules/transactions/services/PayPaymentSlipService';

export default class PaymentSlipController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      amount,
      dueDate,
      paymentPenalty,
      interest,
      interestType,
    } = request.body;
    const { id } = request.account;

    const createPaymentSlip = container.resolve(CreatePaymentSlipService);

    const document = await createPaymentSlip.execute({
      amount,
      dueDate,
      paymentPenalty,
      interest,
      interestType,
      gotoId: id,
    });

    return response.json(classToClass(document));
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { document } = request.params;

    const showPaymentSlip = container.resolve(ShowPaymentSlipService);

    const showDocument = await showPaymentSlip.execute({
      document,
    });

    return response.json(classToClass(showDocument));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.account;
    const { document } = request.params;

    const payPaymentSlip = container.resolve(PayPaymentSlipService);

    const showDocument = await payPaymentSlip.execute({
      id,
      document,
    });

    return response.json(classToClass(showDocument));
  }
}
