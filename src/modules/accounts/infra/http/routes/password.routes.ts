import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ResetUserPasswordController from '@modules/accounts/infra/http/controllers/ResetUserPasswordController';
import ResetStorePasswordController from '@modules/accounts/infra/http/controllers/ResetStorePasswordController';

import ForgotUserPasswordController from '../controllers/ForgotUserPasswordController';
import ForgotStorePasswordController from '../controllers/ForgotStorePasswordController';

const passwordRouter = Router();
const forgotUserPasswordController = new ForgotUserPasswordController();
const forgotStorePasswordController = new ForgotStorePasswordController();
const resetUserPasswordController = new ResetUserPasswordController();
const resetStorePasswordController = new ResetStorePasswordController();

passwordRouter.post(
  '/users/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      cpf: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(11),
    },
  }),
  forgotUserPasswordController.create,
);
passwordRouter.post(
  '/users/reset',
  celebrate({
    [Segments.BODY]: {
      token: Joi.string().uuid().required(),
      password: Joi.string().required(),
      password_confirmation: Joi.string().required().valid(Joi.ref('password')),
    },
  }),
  resetUserPasswordController.create,
);

passwordRouter.post(
  '/stores/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      cnpj: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(14),
    },
  }),
  forgotStorePasswordController.create,
);
passwordRouter.post(
  '/stores/reset',
  celebrate({
    [Segments.BODY]: {
      token: Joi.string().uuid().required(),
      password: Joi.string().required(),
      password_confirmation: Joi.string().required().valid(Joi.ref('password')),
    },
  }),
  resetStorePasswordController.create,
);

export default passwordRouter;
