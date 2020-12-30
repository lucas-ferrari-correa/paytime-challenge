import { Router } from 'express';

import accountsRouter from '@modules/accounts/infra/http/routes/accounts.routes';
import sessionsRouter from '@modules/accounts/infra/http/routes/sessions.routes';
import profileRouter from '@modules/accounts/infra/http/routes/profile.routes';
import passwordRouter from '@modules/accounts/infra/http/routes/password.routes';

const routes = Router();

routes.use('/accounts', accountsRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/profile', profileRouter);
routes.use('/password', passwordRouter);

export default routes;
