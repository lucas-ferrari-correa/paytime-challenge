import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import UserSessionsController from '@modules/accounts/infra/http/controllers/UserSessionsController';
import StoreSessionsController from '@modules/accounts/infra/http/controllers/StoreSessionsController';

const sessionsRouter = Router();
const userSessionsController = new UserSessionsController();
const storeSessionsController = new StoreSessionsController();

sessionsRouter.post(
  '/users',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
    },
  }),
  userSessionsController.create,
);

sessionsRouter.post(
  '/stores',
  celebrate({
    [Segments.BODY]: {
      cnpj: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(14),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
    },
  }),
  storeSessionsController.create,
);

export default sessionsRouter;
