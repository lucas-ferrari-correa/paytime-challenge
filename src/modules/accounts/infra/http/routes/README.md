# **accounts/infra/http/routes**

A pasta `routes` é responsável por armazenar as Rotas pertinente às contas.

Para todas as rotas foi utilizada a biblioteca `celebrate` para validação de informações de requisição (como obrigatoriedade e certos tipos de informações)

# accounts.routes
Responsável pelas rotas de criação de contas usuário e estabelecimento. Ela terá como caminho o `/accounts/`
- `POST /accounts/users`: esta rota é responsável pela criação de contas usuário.
    - `accountName`: string obrigatória
    - `cpf`: string obrigatória, tendo como tamanho igual a 11 e só podendo ser numérico de 0 a 9
    - `email`: string obrigatória com formatação de email
    - `password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial.
```
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
```
- `POST /accounts/stores`: esta rota é responsável pela criação de contas estabelecimento.
    - `accountName`: string obrigatória
    - `cnpj`: string obrigatória, tendo como tamanho igual a 14 e só podendo ser numérico de 0 a 9
    - `password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial.
    - `accountUserId`: string obrigatória uuid.
```
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
```

# password.routes
Responsável pelas rotas de recuperação de senha de contas usuário e estabelecimento. Ela terá como caminho o `/password/`
- `POST /password/users/forgot`: esta rota é responsável pelo envio de email de recuperação de contas usuário.
    - `email`: string obrigatória com formatação de email
    - `cpf`: string obrigatória, tendo como tamanho igual a 11 e só podendo ser numérico de 0 a 9
```
[Segments.BODY]: {
      email: Joi.string().email().required(),
      cpf: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(11),
    },
```
- `POST /password/stores/forgot`: esta rota é responsável pelo envio de email de recuperação de contas estabelecimento.
    - `email`: string obrigatória com formatação de email. Este email é o email cadastrado da conta usuário ao qual o estabelecimento pertence.
    - `cnpj`: string obrigatória, tendo como tamanho igual a 14 e só podendo ser numérico de 0 a 9
```
[Segments.BODY]: {
      email: Joi.string().email().required(),
      cnpj: Joi.string()
        .required()
        .regex(/^[0-9]+$/)
        .length(14),
    },
```
- `POST /password/reset`: esta rota é responsável pela alteração da senha de qualquer tipo de conta.
    - `token`: string uuid obrigatória. Token enviado pelo email de recuperação
    - `password`: string obrigatória, tendo como tamanho igual a 14 e só podendo ser numérico de 0 a 9
    - `password_confirmation`: string obrigatória. Ele verificará se o campo `password` foi preenchido e irá validar se o valor deste campo é semelhante ao do outro campo.
```
[Segments.BODY]: {
      token: Joi.string().uuid().required(),
      password: Joi.string()
        .required()
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        ),
      password_confirmation: Joi.string().required().valid(Joi.ref('password')),
    },
```

# profile.routes
Responsável pelas rotas de visualização e alteração de contas usuário e estabelecimento. Ela terá como caminho o `/profile/`.

Todas as rotas deste arquivo são autenticadas
```
profileRouter.use(ensureAuthenticated);
```

- `GET /profile/users`: esta rota é responsável pela visualização da conta usuário autenticada e de todas as contas estabelecimento pertencentes ao usuário. Nela não é requerido nenhum body de requisição.
- `POST /profile/users`: esta rota é responsável pela alteração da conta usuário autenticada.
    - `accountName`: string obrigatória
    - `cpf`: string obrigatória, tendo como tamanho igual a 11 e só podendo ser numérico de 0 a 9
    - `email`: string obrigatória com formatação de email
    - `old_password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial. Esta é a senha atual que deseja ser alterada.
    - `password`: esta é a nova senha da conta caso necessário. Ela terá as mesmas especificações da `old_password`.
    - `password_confirmation`: confirmação da nova senha.
```
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
```
- `GET /profile/stores`: esta rota é responsável pela visualização da conta estabelecimento autenticada. Nela não é requerido nenhum body de requisição.
- `POST /profile/stores`: esta rota é responsável pela alteração da conta estabelecimento autenticada.
    - `accountName`: string obrigatória
    - `cnpj`: string obrigatória, tendo como tamanho igual a 14 e só podendo ser numérico de 0 a 9
    - `accountUserId`: string obrigatória uuid.
    - `old_password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial. Esta é a senha atual que deseja ser alterada.
    - `password`: esta é a nova senha da conta caso necessário. Ela terá as mesmas especificações da `old_password`.
    - `password_confirmation`: confirmação da nova senha.
```
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
```

# sessions.router
Responsável pelas rotas de autenticação de contas usuário e estabelecimento. Ela terá como caminho o `/sessions/`.
- `POST /sessions/users`: esta rota é responsável pela autenticação da conta usuário.
    - `email`: string obrigatória com formatação de email
    - `password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial. Esta é a senha atual que deseja ser alterada.
```
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
```
- `POST /sessions/stores`: esta rota é responsável pela autenticação da conta estabelecimento.
    - `cnpj`: string obrigatória, tendo como tamanho igual a 14 e só podendo ser numérico de 0 a 9.
    - `password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial. Esta é a senha atual que deseja ser alterada.
```
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
```
