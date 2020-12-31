import { Router } from 'express';

import accountsRouter from '@modules/accounts/infra/http/routes/accounts.routes';
import sessionsRouter from '@modules/accounts/infra/http/routes/sessions.routes';
import profileRouter from '@modules/accounts/infra/http/routes/profile.routes';
import passwordRouter from '@modules/accounts/infra/http/routes/password.routes';

import transactionsRouter from '@modules/transactions/infra/http/routes/transactions.routes';
import paymentSlipRouter from '@modules/transactions/infra/http/routes/paymentslip.routes';
import depositsRouter from '@modules/transactions/infra/http/routes/deposits.routes';

const routes = Router();

routes.use('/accounts', accountsRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/profile', profileRouter);
routes.use('/password', passwordRouter);

routes.use('/transactions', transactionsRouter);
routes.use('/paymentslips', paymentSlipRouter);
routes.use('/deposits', depositsRouter);

export default routes;
