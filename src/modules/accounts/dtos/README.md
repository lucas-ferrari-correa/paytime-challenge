# **accounts/dtos**

A pasta `dtos` é responsável por armazenar os Data Transfer Objects responsáveis pelas criações das contas.

- **ICreateUserAccountDTO**: DTO responsável pela criação de contas usuários. Por definição o montante da conta (`amount`) será 0 (o que será realizado dentro do serviço de criação). Para criar uma conta de usuário é necessário um nome (`accountName`), `email`, `cpf` e senha (`password`).
- **ICreateStoreAccountDTO**: DTO responsável pela criação de contas estabelecimento. Por definição o montante da conta (`amount`) será 0 (o que será realizado dentro do serviço de criação). Para criar uma conta de usuário é necessário a sua Razão Social (`accountName`), `cnpj`, senha (`password`) e o ID da conta usuário a qual pertence (`accountUserId`).
