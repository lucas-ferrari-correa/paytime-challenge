# **accounts/infra/http/middlewares**

A pasta `middlewares` é responsável por armazenar os Middlewares das Rotas pertinente às contas.

# ensureAuthenticated
Em algumas rotas específicas (normalmente que envolvem operações de contas, como atualização ou transferências) há a necessidade de se ter uma autententicação por meio de um token JWT.

O middleware então verificará se o `header` da requisição possui uma `authorization`. Na falta ele retornará um erro. Tendo, ele fará a decodificação do token validando com o secret estabelecido no arquivo `@config/auth`.

```
try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { sub } = decoded as ITokenPayload;

    request.account = {
      id: sub,
    };

    return next();
  }
```
Tendo êxito ele seguirá para a próxima função dentro da rota.
