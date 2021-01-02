import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import UserAccountsController from '@modules/accounts/infra/http/controllers/UserAccountsController';
import StoreAccountsController from '@modules/accounts/infra/http/controllers/StoreAccountsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const accountsRouter = Router();
const userAccountsController = new UserAccountsController();
const storeAccountsController = new StoreAccountsController();

accountsRouter.post(
  '/users',
  celebrate({
    [Segments.BODY]: {
      accountName: Joi.string().required(),
      cpf: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(11),
      email: Joi.string().email().required(),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
    },
  }),
  userAccountsController.create,
);

accountsRouter.post(
  '/stores',
  ensureAuthenticated,
  celebrate({
    [Segments.BODY]: {
      accountName: Joi.string().required(),
      cnpj: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(14),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      accountUserId: Joi.string().required().uuid(),
    },
  }),
  storeAccountsController.create,
);

export default accountsRouter;
