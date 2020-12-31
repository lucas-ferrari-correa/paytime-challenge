import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import PaymentSlipController from '@modules/transactions/infra/http/controllers/PaymentSlipController';

import ensureAuthenticated from '@modules/accounts/infra/http/middlewares/ensureAuthenticated';

const accountsRouter = Router();
const paymentSlipController = new PaymentSlipController();

accountsRouter.post(
  '/create',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      amount: Joi.number().required(),
      dueDate: Joi.date().required(),
      paymentPenalty: Joi.number().required(),
      interest: Joi.number().required(),
      interestType: Joi.number().required(),
    },
  }),
  paymentSlipController.create,
);

accountsRouter.get(
  '/show/:id',
  ensureAuthenticated,
  paymentSlipController.show,
);

accountsRouter.post(
  '/pay/:id',
  ensureAuthenticated,
  paymentSlipController.update,
);

export default accountsRouter;
