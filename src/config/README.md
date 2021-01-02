# **config**

A pasta `config` é responsável por armazenar os arquivos de configuração de autenticação, cache e envio de email.

- **auth.ts**: contém as configurações de autenticação onde o secret é definido pela variável `APP_SECRET` do arquivo de ambiente. O token está definido para expirar em 2h
- **cache.ts**: contém a interface de configuração do redis de acordo com as variáveis de ambiente `REDIS_HOST`, `REDIS_PORT` e `REDIS_PASSWORD`
- **mail.ts** contém a interface de configuração do envio de email para recuperação de senha das contas. Elas são definidas pelas variáveis de ambiente `MAIL_DRIVER`, `MAIL_EMAIL` e `MAIL_NAME`. Estas variáveis são importantes apenas para o ambiente de produção. Em desenvolvimento será utilizado o Ethereal.
