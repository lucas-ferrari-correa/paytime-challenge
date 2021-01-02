import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ResetPasswordController from '@modules/accounts/infra/http/controllers/ResetPasswordController';

import ForgotUserPasswordController from '../controllers/ForgotUserPasswordController';
import ForgotStorePasswordController from '../controllers/ForgotStorePasswordController';

const passwordRouter = Router();
const forgotUserPasswordController = new ForgotUserPasswordController();
const forgotStorePasswordController = new ForgotStorePasswordController();
const resetPasswordController = new ResetPasswordController();

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
  '/reset',
  celebrate({
    [Segments.BODY]: {
      token: Joi.string().uuid().required(),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      password_confirmation: Joi.string().required().valid(Joi.ref('password')),
    },
  }),
  resetPasswordController.create,
);

export default passwordRouter;
