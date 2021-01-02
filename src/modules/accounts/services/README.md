# **accounts/services**
Nesta pasta estão armazenados todos os serviços e testes referentes ao domínio de contas.

Todos os testes estão com suas respectivas descrições.

# AuthenticateStoreAccountService
Serviço de autenticação de contas estabelecimento.
Ela utilizará o repositório de Contas (`AccountsRepository`) e o provedor de Hash (`HashProvider`) através das ClassDecorators `@inject`

Ela é alimentada com o `cnpj` e a senha (`password`) do Controller.

Inicialmente ela procurará se existe uma conta estabelecimento com o CNPJ existente. Caso não exista, deverá retornar um erro de combinação incorreta.

Depois utilizará o `hashProvider` para comparar as senhas da conta estabelecimento encontrada com a fornecida pela requisição. Caso não bata, deverá retornar um erro de combinação incorreta.

A partir disso ela irá gerar um token vinculado ao `id` da conta estabelecimento. Com este token será possível realizar outras operações com a conta estabelecimento.

# AuthenticateUserAccountService
Serviço de autenticação de contas usuário.
Ela utilizará o repositório de Contas (`AccountsRepository`) e o provedor de Hash (`HashProvider`) através das ClassDecorators `@inject`

Ela é alimentada com o `email` e a senha (`password`) do Controller.

Inicialmente ela procurará se existe uma conta usuário com o email existente. Caso não exista, deverá retornar um erro de combinação incorreta.

Depois utilizará o `hashProvider` para comparar as senhas da conta usuário encontrada com a fornecida pela requisição. Caso não bata, deverá retornar um erro de combinação incorreta.

A partir disso ela irá gerar um token vinculado ao `id` da conta usuário. Com este token será possível realizar outras operações com a conta usuário.

# CreateStoreAccountService
Serviço de criação de contas estabelecimento.
Ela utilizará o repositório de Contas (`AccountsRepository`), o provedor de Hash (`HashProvider`), o provedor de Cache (`CacheProvider`) e o provedor de CpfCnpj (`CpfCnpjProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest` e o `tokenAccountId` que conterá o token da conta usuário que irá criar o estabelecimento.
```
interface IRequest {
  accountName: string;
  cnpj: string;
  password: string;
  accountUserId: string;
}
```

Inicialmente verificará se o `tokenAccountId` é de uma conta conta usuário. Em seguida verificará a formatação do CNPJ e se já existe uma outra conta estabelecimento com o mesmo CNPJ ou com a mesma Razão Social (`accountName`).

Depois ela verificará se o `id` da conta usuário fornecido (`accountUserId`) já está cadastrada. Por fim, ao passar por todas estas verificações ela irá criar uma conta de usuário através do `createStoreAccount` com um `amount` inicial de 0.

Ao final o serviço irá salver em cache esta conta estabelecimento.

# CreateUserAccountService
Serviço de criação de contas usuário.
Ela utilizará o repositório de Contas (`AccountsRepository`), o provedor de Hash (`HashProvider`), o provedor de Cache (`CacheProvider`) e o provedor de CpfCnpj (`CpfCnpjProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  accountName: string;
  email: string;
  cpf: string;
  password: string;
}
```

Inicialmente verificará a formatação do CPF e se já existe uma outra conta usuário com o mesmo CPF.

Depois ela verificará se o `email` da requisição já está cadastrado. Por fim, ao passar por todas estas verificações ela irá criar uma conta de usuário através do `createUserAccount` com um `amount` inicial de 0.

Ao final o serviço irá salver em cache esta conta usuário.

# ResetPasswordService
Serviço de recuperação de senhas de contas.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de tokens de contas (`AccountTokensRepository`) e o provedor de Hash (`HashProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  token: string;
  password: string;
}
```

Inicialmente verificará se o token existe na tabela de tokens de contas. Em seguida verificará se a conta relacionada ao token existe. Por final verificará se o token expirou (expiração de 2 horas).

Ao final ele gerará um novo hash para a senha irá salvar a conta com a nova senha na tabela `accounts`.

# SendForgotStorePasswordEmailService
Serviço de envio de recuperação de contas estabelecimento.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de tokens de contas (`AccountTokensRepository`) e o provedor de envio de Email (`MailProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  email: string;
  cnpj: string;
}
```

Inicialmente será verificado se existe alguma conta estabelecimento com CNPJ fornecido e também se existe alguma conta usuário com o email fornecido.

Em seguida irá verificar qual é a conta usuário vinculada a conta estabelecimento e irá verificar se o email fornecido pela requisição bate com o email desta conta usuário.

Passando por todos estes testes será enviado um email pelo `sendMail` utilizando os seguintes parâmetros
```
await this.mailProvider.sendMail({
      to: {
        name: storeAccount.accountName,
        email: emailUserAccount.email,
      },
      subject: '[Paytime Challenge] Recuperação de senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: `${storeAccount.accountName} [conta estabelecimento]`,
          token: `${token}`,
        },
      },
    });
```
- Onde o `forgotPasswordTemplate` é o template do email de recuperação de senha.

# SendForgotUserPasswordEmailService
Serviço de envio de recuperação de contas usuário.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de tokens de contas (`AccountTokensRepository`) e o provedor de envio de Email (`MailProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  email: string;
  cpf: string;
}
```

Inicialmente será verificado se existe alguma conta estabelecimento com email fornecido e se o CPF desta conta encontrada bate com o CPF fornecido pela requisição.

Passando por todos estes testes será enviado um email pelo `sendMail` utilizando os seguintes parâmetros
```
await this.mailProvider.sendMail({
      to: {
        name: userAccount.accountName,
        email: userAccount.email,
      },
      subject: '[Paytime Challenge] Recuperação de senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: `${userAccount.accountName} [conta usuário]`,
          token: `${token}`,
        },
      },
    });
```
- Onde o `forgotPasswordTemplate` é o template do email de recuperação de senha.

# ShowStoreProfileService
Serviço de envio de visualização de contas estabelecimento.
Ela utilizará o repositório de Contas (`AccountsRepository`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  account_id: string;
}
```

Inicialmente será verificado se no cache das contas de estabelecimento existe uma conta com o `account_id` fornecido.

Caso não exista ela irá verificar no BD se a conta estabelecimento existe e irá salvar no cache.

# ShowUserProfileService
Serviço de envio de visualização de contas usuário e de suas respectivas contas estabelecimento.
Ela utilizará o repositório de Contas (`AccountsRepository`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  account_id: string;
}
```

Inicialmente será verificado se no cache das contas de usuário existe uma conta com o `account_id` fornecido.

Caso não exista ela irá verificar no BD se a conta estabelecimento usuário existe.

Depois verificará se existem contas estabelecimento vinculadas a conta usuário no cache. Caso não exista ele irá encontrá-las no BD.

Ao final será retornado um objeto com as informações da conta usuário e de todas as contas estabelecimento vinculadas a ele.

# UpdateStoreProfileService
Serviço de envio de atualização de contas estabelecimento.
Ela utilizará o repositório de Contas (`AccountsRepository`), o provedor de Hash (`HashProvider`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  account_store_id: string;
  accountName: string;
  cnpj: string;
  accountUserId: string;
  old_password?: string;
  password?: string;
}
```

Inicialmente será verificado se a conta estabelecimento existe no BD.

Em seguida serão verificados se o novo CNPJ já está sendo utilizado por outra conta estabelecimento e se a conta usuário a ser vinculada existe no BD.

Caso seja necessário mudar a senha, será verificado se a senha antiga foi enviada e se ela bate com o que existe no BD.

Em seguida as alterações desta conta são armazenadas no cache das contas estabelecimento.

# UpdateUserProfileService
Serviço de envio de atualização de contas usuário.
Ela utilizará o repositório de Contas (`AccountsRepository`), o provedor de Hash (`HashProvider`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada segundo a interface `IRequest`.
```
interface IRequest {
  account_user_id: string;
  accountName: string;
  cpf: string;
  email: string;
  old_password?: string;
  password?: string;
}
```

Inicialmente será verificado se a conta usuário existe no BD.

Em seguida serão verificados se o novo email e CPF já estão sendo utilizados por outra conta usuário.

Caso seja necessário mudar a senha, será verificado se a senha antiga foi enviada e se ela bate com o que existe no BD.

Em seguida as alterações desta conta são armazenadas no cache das contas usuário.
