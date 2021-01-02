# **accounts/infra/http/controllers**

A pasta `controllers` é responsável por armazenar os Controladores de Rotas pertinente às contas.

# ForgotStorePasswordController
Nela serão inseridas as informações `email` e `cnpj` do corpo da requisição de esquecimento de senha das contas estabelecimento.
Por sua vez ela executará o serviço `SendForgotStorePasswordEmailService` que enviará um email para o email cadastrado da conta de usuário a qual o estabelecimento pertence.

# ForgotStorePasswordController
Nela serão inseridas as informações `email` e `cpf` do corpo da requisição de esquecimento de senha das contas usuário.
Por sua vez ela executará o serviço `SendForgotUserPasswordEmailService` que enviará um email para o email cadastrado da conta de usuário.

# ResetPasswordController
Nela serão inseridas as informações `password` e `token` (token enviado pelo email) do corpo da requisição de recuperação de senha das contas usuário ou estabelecimento.
Por sua vez ela executará o serviço `ResetPasswordService` que resetará a senha da conta de acordo com a senha fornecida na requisição.

# StoreAccountsController
Nela serão inseridas as informações `accountName`, `cnpj`, `password` e `accountUserId` do corpo da requisição (todas contidas em `data`) de criação de contas de estabelecimento.
Por sua vez ela executará o serviço `CreateStoreAccountService` que criará uma conta de estabelecimento vinculada a uma conta de usuário.

# StoreProfileController
- **show**: Nela será inserido o `id` do estabelecimento autenticado que realizou a requisição. Este `id` é visível graças ao serviço de Autenticação de contas de estabelecimento (`AuthenticateStoreAccountService`).
Com o `id` se executará o serviço `ShowStoreProfileService` que exibirá as informações da conta estabelecimento do estabelecimento autenticado.
- **update**: Nela será inserido o `id` do estabelecimento autenticado que realizou a requisição. Em seguida será executado o serviço `UpdateStoreProfileService` para atualizações do perfil do estabelecimento.

# StoreSessionsController
Nela será inserido o `cnpj` do estabelecimento que realizou a requisição e o `email` do usuário ao qual o estabelecimento pertence.
Ele executará o serviço `AuthenticateStoreAccountService` possibilitando ao estabelecimento se autenticar e a realizar outras operações.

# UserAccountsController
Nela serão inseridas as informações `accountName`, `cpf`, `password` e `email` do corpo da requisição (todas contidas em `data`) de criação de contas de usuário.
Por sua vez ela executará o serviço `CreateUserAccountService` que criará uma conta de usuário.

# UserProfileController
- **show**: Nela será inserido o `id` do usuário autenticado que realizou a requisição. Este `id` é visível graças ao serviço de Autenticação de contas usuário (`AuthenticateUserAccountService`).
Com o `id` se executará o serviço `ShowUserProfileService` que exibirá as informações da conta usuário autenticado e das contas estabelecimento pertencentes ao usuário.
- **update**: Nela será inserido o `id` do usuário autenticado que realizou a requisição. Em seguida será executado o serviço `UpdateUserProfileService` para atualizações do perfil do usuário.

# UserSessionsController
Nela será inserido o `cpf` e `email` do usuário que realizou a requisição.
Ele executará o serviço `AuthenticateUserAccountService` possibilitando ao usuário se autenticar e a realizar outras operações.
