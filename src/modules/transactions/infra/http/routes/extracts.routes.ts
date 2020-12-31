import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ExtractController from '@modules/transactions/infra/http/controllers/ExtractController';

import ensureAuthenticated from '@modules/accounts/infra/http/middlewares/ensureAuthenticated';

const accountsRouter = Router();
const extractController = new ExtractController();

accountsRouter.post(
  '/',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      initialDateDay: Joi.number().required(),
      initialDateMonth: Joi.number().required(),
      initialDateMont: Joi.number().required(),
    },
  }),
  extractController.create,
);

export default accountsRouter;
