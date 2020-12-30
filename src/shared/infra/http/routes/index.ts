import { Router } from 'express';

import accountsRouter from '@modules/accounts/infra/http/routes/accounts.routes';
import sessionsRouter from '@modules/accounts/infra/http/routes/sessions.routes';
import profileRouter from '@modules/accounts/infra/http/routes/profile.routes';

const routes = Router();

routes.use('/accounts', accountsRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/profile', profileRouter);

export default routes;
