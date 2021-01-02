# **transactions/dtos**

A pasta `dtos` é responsável por armazenar os Data Transfer Objects responsáveis pelas criações de documentos de transações.

- **ICreateDepositDTO**: DTO responsável pela criação de depositos. Para criar um depósito é necessário um nome do depositante (`depositName`), `amount` e uma conta destinatário `gotoAccountId`.
- **ICreatePaymentSlipDTO**: DTO responsável pela criação de boletos de pagamento. Para criar um boleto é necessário um `amount`, uma data de vencimento (`dueDate`), uma multa por atraso (`paymentPenalty`), um valor de juros (`interest`) e um tipo de juros (`interestType`)
- **ICreateTransactionDTO**: DTO responsável pela criação de transações diretas. Para criar uma transação é necessário um `amount` e uma conta destinatário `gotoAccountId`.
