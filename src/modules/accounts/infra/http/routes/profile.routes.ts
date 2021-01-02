import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import UserProfileController from '@modules/accounts/infra/http/controllers/UserProfileController';
import StoreProfileController from '@modules/accounts/infra/http/controllers/StoreProfileController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const profileRouter = Router();
const userProfileController = new UserProfileController();
const storeProfileController = new StoreProfileController();

profileRouter.use(ensureAuthenticated);

profileRouter.get('/users', userProfileController.show);
profileRouter.put(
  '/users',
  celebrate({
    [Segments.BODY]: {
      accountName: Joi.string().required(),
      email: Joi.string().email().required(),
      cpf: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(11),
      old_password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      password_confirmation: Joi.string()
        .required()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
        .valid(Joi.ref('password')),
    },
  }),
  userProfileController.update,
);

profileRouter.get('/stores', storeProfileController.show);
profileRouter.put(
  '/stores',
  celebrate({
    [Segments.BODY]: {
      accountName: Joi.string().required(),
      cnpj: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(14),
      accountUserId: Joi.string().required().uuid(),
      old_password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      password_confirmation: Joi.string()
        .required()
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
        .valid(Joi.ref('password')),
    },
  }),
  storeProfileController.update,
);

export default profileRouter;
