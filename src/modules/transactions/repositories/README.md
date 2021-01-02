# **transactions/repositories**
Nesta pasta estão armazenados os `fakes` dos repositórios de consulta das tabelas do BD, além das interfaces dos próprios repositórios.

Enquanto os `fakes` utilizam como repositório um array do tipo `Document` que armazenará os documentos criados dentro dos testes, os repositórios originais (contidos em `transactions/infra/typeorm/repositories`) irão implementar o `getRepository` do TypeORM.

Desta forma, caso seja necessário alterar o ORM da aplicação, não será necessário alterar os serviços de forma direta, deverá ser alterado somente os arquivos de repositório.

## IDocumentsRepository
Tanto o `fake` quanto o repositório deverão implementar os seguintes métodos:
- `findAllExitsByDate`: a partir de uma `date` e `id` ele retornará um conjunto de documentos em que a conta de origem (`fromAccountId`) corresponda com o `id` e as datas de pagamento (`paymentDate`) sejam depois da data inicial (`date`) e que tenham como status de pagamento (`paymentStatus`) que signfica que foi pago.
- `findAllExitsByDate`: a partir de uma `date` e `id` ele retornará um conjunto de documentos em que a conta de destino (`gotoAccountId`)  corresponda com o `id` e as datas de pagamento (`paymentDate`) sejam depois da data inicial (`date`) e que tenham como status de pagamento (`paymentStatus`) que signfica que foi pago.
- `createDeposit`: a partir de um `documentData` definido por `ICreateDepositDTO` ele irá criar um documento de transação relativo a um depósito e irá salvar na tabela `documents`.
- `findByDocument`: a partir de um `document` ele irá encontrar o primeiro documento de transação com esta informação.
- `createPaymentSlip`: a partir de um `documentData` definido por `ICreatePaymentSlipDTO` ele irá criar um documento de transação relativo a um boleto e irá salvar na tabela `documents`.
- `createPaymentSlip`: a partir de um `documentData` definido por `ICreateTransactionDTO` ele irá criar um documento de transação relativo a uma transação direta e irá salvar na tabela `documents`.
- `save`: a partir de uma `document` ele a salvará na tabela `documents`.
