import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import TransactionController from '@modules/transactions/infra/http/controllers/TransactionController';

import ensureAuthenticated from '@modules/accounts/infra/http/middlewares/ensureAuthenticated';

const accountsRouter = Router();
const transactionController = new TransactionController();

accountsRouter.post(
  '/',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      gotoAccountId: Joi.string().required(),
      amount: Joi.number().required(),
    },
  }),
  transactionController.create,
);

export default accountsRouter;
