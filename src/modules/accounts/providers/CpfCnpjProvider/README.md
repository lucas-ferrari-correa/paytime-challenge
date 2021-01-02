# **accounts/providers/CpfCnpjProvider**
Dentro desta pasta haverão 3 pastas responsáveis pela configuração deste provedor de verificação de CPF e CNPJ:
- fakes: responsável por armazenar os arquivos de `fakeProvider` para alimentar os testes.
- implementations: responsável por armazenar os arquivos provider para alimentar os serviços.
- models: responsável por armazenar os arquivos de interface contendo quais são os métodos dos providers. Lembrando que tanto quanto o fake quanto o provider original precisam ter os mesmos métodos.

# ICpfCnpjProvider
Nela estão definidos dois métodos:
- `checkCpfFormat`: que irá verificar os dois dígitos verificadores do CPF. Para um CPF de uma conta de usuário ser validado ele precisará passar pela regra implementada.
- `checkCnpjFormat`: que irá verificar os dois dígitos verificadores do CNPJ. Para um CNPJ de uma conta de estabelecimento ser validado ele precisará passar pela regra implementada.

O algorítmo de verificação dos 2 últimos dígitos do CPF e do CNPJ são muito parecidos e podem ser verificados nestes sites: [CPF](https://www.geradorcpf.com/algoritmo_do_cpf.htm) e [CNPJ](https://www.geradorcnpj.com/algoritmo_do_cnpj.htm)

Ou seja, independente da biblioteca a ser implementada de verificação do CPF e do CNPJ, o provedor de verificação deverá ter estes dois métodos.
