# **transactions/infra/http/routes**

A pasta `routes` é responsável por armazenar as Rotas pertinente aos documentos de transações.

Para todas as rotas foi utilizada a biblioteca `celebrate` para validação de informações de requisição (como obrigatoriedade e certos tipos de informações). Todas estas rotas precisarão estar autenticadas utilizando o middleware `ensureAuthenticated` de `accounts/infra/http/middlewares/ensureAuthenticated`

# deposits.routes
Responsável pelas rotas de criação de depósito. Ela terá como caminho o `/deposits/`
- `POST /deposits/`: esta rota é responsável pela criação de depósitos.
    - `gotoAccountId`: string obrigatória
    - `depositName`: string obrigatória
    - `amount`: number obrigatória
```
[Segments.BODY]: {
      gotoAccountId: Joi.string().required(),
      depositName: Joi.string().required(),
      amount: Joi.number().required(),
    },
```

# extracts.routes
Responsável pelas rotas de listagem de extratos. Ela terá como caminho o `/extracts/`
- `GET /extracts/`: esta rota é responsável pela listagem de extrato da conta.
    - `initialDateDay`: number obrigatória
    - `initialDateMonth`: number obrigatória
    - `initialDateYear`: number obrigatória
```
[Segments.BODY]: {
      initialDateDay: Joi.number().required(),
      initialDateMonth: Joi.number().required(),
      initialDateYear: Joi.number().required(),
    },
```

# transactions.routes
Responsável pelas rotas de criação de transações diretas. Ela terá como caminho o `/transactions/`

- `POST /transactions/`: esta rota é responsável pela criação de transações diretas.
    - `gotoAccountId`: string obrigatória
    - `amount`: number obrigatória
```
[Segments.BODY]: {
      gotoAccountId: Joi.string().required(),
      amount: Joi.number().required(),
    },
```

# paymentslip.router
Responsável pelas rotas de criação, visualização e pagamento de boletos. Ela terá como caminho o `/paymentslips/`.
- `POST /paymentslips/create`: esta rota é responsável pela criação de boletos de pagamento.
    - `amount`: number obrigatória
    - `dueDate`: data obrigatória
    - `paymentPenalty`: number obrigatória
    - `interest`: number obrigatória
    - `interestType`: number obrigatória
```
[Segments.BODY]: {
      amount: Joi.number().required(),
      dueDate: Joi.date().required(),
      paymentPenalty: Joi.number().required(),
      interest: Joi.number().required(),
      interestType: Joi.number().required(),
    },
```
- `GET /paymentslips/show/:id`: esta rota é responsável pela visualização do boleto.
    - Esta rota não terá um corpo de requisição, apenas o parâmetro de rota fornecido através do `id` do documento do boleto de pagamento

- `GET /paymentslips/pay/:id`: esta rota é responsável pelo pagamento do boleto.
    - Esta rota não terá um corpo de requisição, apenas o parâmetro de rota fornecido através do `id` do documento do boleto de pagamento.
