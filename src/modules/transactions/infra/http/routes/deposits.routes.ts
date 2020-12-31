import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import DepositController from '@modules/transactions/infra/http/controllers/DepositController';

const accountsRouter = Router();
const depositController = new DepositController();

accountsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      gotoAccountId: Joi.string().required(),
      depositName: Joi.string().required(),
      amount: Joi.number().required(),
    },
  }),
  depositController.create,
);

export default accountsRouter;
