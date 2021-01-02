# **accounts/providers/HashProvider**
Dentro desta pasta haverão 3 pastas responsáveis pela configuração deste provedor de hash de senhas:
- fakes: responsável por armazenar os arquivos de `fakeProvider` para alimentar os testes.
- implementations: responsável por armazenar os arquivos provider para alimentar os serviços.
- models: responsável por armazenar os arquivos de interface contendo quais são os métodos dos providers. Lembrando que tanto quanto o fake quanto o provider original precisam ter os mesmos métodos.

# IHashProvider
Nela estão definidos dois métodos:
- `generateHash`: que irá gerar um hash a partir de uma string fornecida.
- `compareHash`: que irá comparar os hash de uma string fornecida e o hash de uma outra string contida no BD.

Como foi utilizado a biblioteca `bcryptjs` para o hash das senhas, será utilizado seus próprios métodos para implementar os métodos de `IHashProvider`.

Ou seja, independente da biblioteca a ser implementada de hash, o provedor de hash deverá ter estes dois métodos.
