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
- `POST /accounts/stores`: esta rota é responsável pela criação de contas estabelecimento.
    - `accountName`: string obrigatória
    - `cnpj`: string obrigatória, tendo como tamanho igual a 14 e só podendo ser numérico de 0 a 9
    - `password`: string obrigatória devendo ter no mínimo 8 caracteres, uma letra maiúscula, uma minuscula, um número e um caracter especial.
    - `accountUserId`: string obrigatória
