# **accounts/repositories**
Nesta pasta estão armazenados os `fakes` dos repositórios de consulta das tabelas do BD, além das interfaces dos próprios repositórios.

Enquanto os `fakes` utilizam como repositório um array do tipo `Account` que armazenará as contas criadas dentro dos testes, os repositórios originais (contidos em `accounts/infra/typeorm/repositories`) irão implementar o `getRepository` do TypeORM.

Desta forma, caso seja necessário alterar o ORM da aplicação, não será necessário alterar os serviços de forma direta, deverá ser alterado somente os arquivos de repositório.

## IAccountsRepository
Tanto o `fake` quanto o repositório deverão implementar os seguintes métodos:
- `findByStoreId`: a partir de um `id` ele retornará uma conta estabelecimento, verificando se ela não possui `cpf` e se possui `cnpj`
- `findByUserId`: a partir de um `id` ele retornará uma conta usuário, verificando se ela possui `cpf` e se não possui `cnpj`
- `findByStoreAccountsUserId`: a partir de um `accountUserId` ele retornará um conjunto de contas estabelecimento que esteja vinculado com a conta usuário indicada pelo `accountUserId`
- `findById`: a partir de um `id` ele retornará a primeira conta que possua este `id`
- `findByUserAccountId`: a partir de um `accountUserId` ele retornará a conta usuário, verificando se ela possui `cpf` e se não possui `cnpj`.
- `findByCompanyName`: a partir de uma razão social `accountName` ele retornará a primeira conta estabelecimento que possua este `accountName`, verificando se ela não possui `cpf` e se possui `cnpj`.
- `findByEmail`: a partir de um `email` ele retornará a primeira conta que possua este `email`
- `findByCnpj`: a partir de um `cnpj` ele retornará a primeira conta estabelecimento que possua este `cnpj`
- `findByCpf`: a partir de um `cpf` ele retornará a primeira conta usuário que possua este `cpf`
- `createUserAccount`: a partir de um `accountData` definido pelo `ICreateUserAccountDTO` ele criará uma conta usuário e a salvará na tabela `accounts`
- `createStoreAccount`: a partir de um `accountData` definido pelo `ICreateStoreAccountDTO` ele criará uma conta estabelecimento e a salvará na tabela `accounts`
- `save`: a partir de uma `account` ele a salvará na tabela `accounts`.
