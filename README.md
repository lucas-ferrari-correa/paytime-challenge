# **Paytime Challenge**

A API desenvolvida em Typescript tem como objetivo simular a criação de contas de usuário, estabelecimentos e transferências entre as respectivas contas.
#
# Estrutura
Há dois tipos de contas em que é possível realizar cadastros:
  - Conta de usuário: a partir de um CPF, nome, email e senha;
  - Conta de estabelecimento: a partir de um CNPJ, Razão Social, senha e ID de uma conta de usuário;


Nesta API cada conta de estabelecimento deverá ser vinculada a uma única conta de usuário. As contas de usuário podem possuir várias contas de estabelecimento. Para cada um dos tipos de contas terão as seguintes funcionalidades:
  - Criação da conta;
  - Autenticação da conta;
  - Visualização dos dados da conta;
  - Atualização dos dados da conta;
  - Envio de e-mail de recuperação de senha;
  - Recuperação de senha;
  - Criação de transações diretas para qualquer tipo de conta;
  - Criação de boletos de pagamento;
  - Visualização de boletos de pagamento;
  - Pagamento dos boletos;
  - Simulação de depósito para qualquer conta;
  - Visualização do extrato individual
#
# Arquitetura
A API foi construída em Typescript utilizando o padrão da Airbnb. Foi escolhido o Typescript por sua tipagem estática, garantindo em muitas oportunidades um melhor fluxo do processo e prevenindo erros oriundos de incompatilidade de tipos.

Banco de Dados:
  - **Postgres**: foi utilizado um banco relacional para o armazenamento dos dados.
  - **TypeORM**: foi utilizado um ORM (gerenciamento de relações de objeto) para as consultas no banco de dados. Foi utilizado especificamente o TypeORM por ser compatível com o Typescript

Memória Cache:
  - **Redis**: foi utilizado um armazenamento de memória para facilitar as consultas.

Encriptação:
  - **bcryptjs**: foi utilizado a biblioteca bcryptjs para a encriptação de senhas.

JWT Token:
  - **jsonwebtoken**: foi utilizado a biblioteca jsonwebtoken para a criação de tokens de autenticação e recuperação de senha.

Verificador de CPF e CNPJ:
  - **CpfCnpjProvider**: Ok, este provedor não é uma biblioteca e sim algo que eu mesmo construi consultando estes dois sites para [CPF](https://www.geradorcpf.com/algoritmo_do_cpf.htm) e [CNPJ](https://www.geradorcnpj.com/algoritmo_do_cnpj.htm). O intuito era de poder verificar se os CPF e os CNPJ estariam formatados corretamente.

Envio de Emails:
  - **Mailtraper**: foi utilizado um serviço de envio de emails em ambiente de desenvolvimento para auxiliar a funcionalidade de recuperação de senha.

Procurou-se manter um padrão de estrutura dos arquivos segundo o **DDD** (Domain Desing Driven). Este padrão garante um melhor desacoplamento de dependências e interfaces e assim uma boa manutenabilidade e escalabilidde do código. Caso seja necessário modificar ou acrescentar alguma nova configuração, serão realizadas o mínimo de intervenções no código.

Sendo assim, de uma forma simples, cada uma das rotas terá um controlador que irá gerenciá-la, que por sua vez terão serviços responsáveis por garantir alguma regra de negócio ou funcionalidade.

Também foi procurado manter um padrão de **TDD** (Test Driven Development) no intuito de orientar o desenvolvimento do código a partir das regras de negócio e suas permissões.

As funcionalidades ficaram inicialmente divididas em:
  - **config**: responsável por armazenar as configurações gerais (como autenticação, cache e envio de email)
  - **modules**: responsável por armazenar as configurações de cada um dos domínios (contas e transações)
  - **shared**: responsável por armazenar as configurações compartilhadas por todos os domínios, as configurações do servidor e de migrations

Por sua vez cada domínio possuía suas respectivas dependências:
  - **dtos**: responsável por armazenar as interfaces de DTO (Data Transfer Objects). Por meio dele seria possível através de uma única tabela, ter componentes distintos.
  - **infra**: responsável por armazenar as configurações de infraestrutura de cada um dos domínios, como os controladores de rotas, middlewares, as rotas e configurações de banco de dados específicos do domínio.
  - **providers**: responsável por armazenar os provedores específicos dos domínios que interagem com os serviços.
  - **repositories**: responsável por armazenar os repositórios de consulta do banco de dados específicos do domínio.
  - **services**: responsável por armazenar os serviços das funcionalidades de cada domínio.

# Tabelas
- Accounts
    - Descrição: ela será responsável por armazenar as informações das contas de usuários e estabelecimentos
    - Colunas:
        - id: uuid
        - accountName: string
        - email: string
        - password: string
        - CPF: string (apenas de numeros)
        - CNPJ: string (apenas de numeros)
        - accountUserId: uuid
        - amount: decimal

- AccountTokens
    - Descrição: ela será responsável por armazenar as informações de tokens de recuperação de senha de todas as contas (usuários e estabelecimento)
    - Colunas
        - id: uuid
        - token: uuid
        - account_id: uuid

- Documents
    - Descrição: ela será responsável por armazenar as informações de todos os documentos relativos a transações (transações diretas, boletos e depósitos) de todas as contas.
    - Colunas:
        - document: uuid
        - type: integer
        - fromAccountId: uuid
        - depositName: string
        - gotoAccountId: uuid
        - amount: decimal
        - paymentStatus: integer
        - dueDate: date
        - paymentPenalty: decimal
        - interest: decimal
        - interestType: integer
        - finalAmount: decimal

# Funções Macro
- Criação de usuário
- Autenticação do usuário
- Criação de estabelecimento
- Autenticação do estabelecimento
- Atualização do perfil (usuário)
- Atualização do perfil (estabelecimento)
- Recuperação de senha (usuário)
- Recuperação de senha (estabelecimento)
- Visualização do perfil (usuário)
- Visualização do perfil (estabelecimento)
- Transferência Direta
- Criação de Boleto de Pagamento
- Pagamento de Boleto
- Visualização do Boleto
- Depósito em Dinheiro
- Listagem do Extrato Detalhado

# Funções Detalhadas
**Criação de usuário**
- Responsável por criar uma conta de usuário
```
POST /accounts/users

{
	"accountName": "accountName",
	"CPF": "CPF",
	"email": "email",
	"password": "password"
}
```
- O usuário deverá ser criado a partir de um CPF, nome, email e senha
- Não poderá haver mais de um mesmo usuário com o mesmo CPF
- Não poderá haver mais de um mesmo usuário com o mesmo email

**Criação de estabelecimento**
- Responsável por criar uma conta de estabelecimento
```
POST /accounts/stores

{
	"accountName": "accountName",
	"CNPJ": "CNPJ",
	"password": "password",
	"accountUserId": "uuid"
}
```
- O estabelecimento deverá ser criado a partir de um CNPJ, Razão Social, senha e código de conta do usuário pertencente.
- Não poderá haver mais de um mesmo estabelecimento com o mesmo CNPJ
- Não poderá haver mais de um mesmo estabelecimento com a mesma Razão Social.
- A conta de usuário pertencente deve existir.
- O estabelecimento deve estar vinculado a um único usuário.

**Autenticação do usuário**
- Responsável por autenticar uma conta de usuário
```
POST /sessions/users

{
	"email": "email",
	"password": "password"
}
```
- Para gerar um token é necessário que o usuário se autentique utilizando seu email e senha apenas.
- O token expirará em 2 horas

**Autenticação do estabelecimento**
- Responsável por autenticar uma conta de estabelecimento
```
POST /sessions/stores

{
	"CNPJ": "CNPJ",
	"password": "password"
}
```
- Para gerar um token é necessário que o estabelecimento se autentique utilizando seu CNPJ e senha apenas.
- O token expirará em 2 horas

**Atualização do perfil (usuário)**
- Responsável por atualizar uma conta de usuário
```
PUT /profile/users

{
	"accountName": "accountName",
	"email": "email",
	"CPF": "CPF"
	"old_password": "old_password",
	"password": "password",
	"password_confirmation": "password_confirmation"
}
```
- O usuário deve poder atualizar seu nome, email, CPF e senha.
- O usuário não pode alterar seu email para um email já utilizado.
- O usuário não pode alterar seu email para um CPF já utilizado.
- Caso deve poder atualizar sua senha informando a senha antiga e uma confirmação.

**Atualização do perfil (estabelecimento)**
- Responsável por atualizar uma conta de estabelecimento
```
PUT /profile/stores

{
	"accountName": "accountName",
	"email": "email",
	"old_password": "old_password",
	"password": "password",
	"password_confirmation": "password_confirmation"
}
```
- O estabelecimento deve poder atualizar sua Razão Social, CNPJ e senha.
- O estabelecimento não pode alterar sua Razão Social para uma Razão Social já utilizada.
- O estabelecimento não pode alterar seu CNPJ para um CNPJ já utilizado.
- Caso deve poder atualizar sua senha informando a senha antiga e uma confirmação.

**Envio de email para recuperação de senha (usuário)**
- Responsável por enviar um email de recuperação de senha de uma conta usuário.
```
POST /password/users/forgot

{
	"email": "email",
	"CPF": "CPF"
}
```
- O usuário deve poder recuperar sua senha informando o seu CPF e e-mail.
- O token enviado por email para resetar a senha, deve expirar em 2 horas.

**Envio de email para recuperação de senha (estabelecimento)**
- Responsável por enviar um email de recuperação de senha de uma conta estabelecimento.
```
POST /password/stores/forgot

{
	"email": "email",
	"CNPJ": "CNPJ"
}
```
- O estabelecimento deve poder recuperar sua senha informando o seu CNPJ e o e-mail do usuário a quem pertence.
- O token enviado por email para resetar a senha, deve expirar em 2 horas.

**Recuperação de senha**
- Responsável por enviar um email de recuperação de senha de uma conta usuário.
```
POST /password/reset

{
	"password": "password",
	"password_confirmation": "password_confirmation",
	"token": "token"
}
```
- O usuário deve poder recuperar sua senha informando o sua nova senha, confirmação e o token enviado por email.
- O token enviado por email para resetar a senha, deve expirar em 2 horas.

**Transações diretas**
- Responsável por efetuar as transações diretas entre contas.
```
POST /transactions

{
	"gotoAccountId": "goto-uuid-account", //Não criptografada
	"amount": 100.00
}
```
- Para realizar a transação deverá ser informado o código de conta do destinatário e o valor.
- Ao enviar a solicitação de transação direta, o valor deverá ser imediatamente transferido ao destinatário.
- A conta deve estar autenticada.
- A requisição deverá enviar o `type = 1` mostrando que se trata de uma transferência direta
- Antes de enviar a solicitação, deverá ser verificado se há saldo em conta para realizar a transação.
- O código da conta do destinatário deve existir.

**Criação de Boleto de Pagamento**
- Responsável por criar boletos de pagamento.
```
POST /paymentslips/create

{
		"amount": 100.00,
		"dueDate": "dueDate",
		"paymentPenalty": 50.00,
		"interest": 0.01,
		"interestType": 1 | 2 | 3, //1 - Juros ao dia, 2 - Juros ao mês ou 3 - Juros ao ano
}
```
- O boleto será criado informando o valor, a data de vencimento, a multa por atraso, o juros (em formato decimal), e o tipo de juros (diário, mensal ou anual).
- A requisição deverá enviar o `type = 2` mostrando que se trata de um boleto de pagamento
- A conta deve estar autenticado.

**Visualização do Boleto de Pagamento**
- Responsável por visualizar um boleto de pagamento.
```
GET /paymentslips/show/:document
```
- Deve ser informado um documento que exista.
- O documento deve ser um boleto, portanto `type = 2`
- A conta precisa estar autenticado.

**Pagamento do Boleto de Pagamento**
- Responsável por pagar um boleto de pagamento.
```
POST /paymentslips/pay/:document
```
- Deve ser informado um documento que exista.
- A conta precisa estar autenticado.
- Deverá ser verificado se há saldo em conta para realizar o pagamento.

**Depósito em dinheiro**
- Responsável por realizar um depósito em dinheiro.
```
POST /deposits

{
	"gotoAccountId": "goto-uuid-account", //Não criptografada
	"fromName": "from-name",
	"amount": 100.00
}
```
- Será possível realizar depósitos em dinheiro. Nesta ocasião qualquer indivíduo sem necessitar de autenticação pode realizar um depósito.
- Poderá ser feito o depósito em dinheiro informando o nome do remetente, o código da conta do destinatário e o valor.
- A requisição deverá enviar o `type = 3` mostrando que se trata de um depósito.

**Listagem do Extrato Detalhado**
- Responsável pela visualização do extrato de uma conta
```
GET /extracts

{
	"initialDateDay": "day",
	"initialDateMonth": "month",
	"initialDateYear": "year"
}
```
- Será possível visualizar o extrato detalhado de uma conta estando o mesmo autenticado.
- Para a visualização do extrato, deve-se informar a data inicial (dia, mês e ano de forma separada)
