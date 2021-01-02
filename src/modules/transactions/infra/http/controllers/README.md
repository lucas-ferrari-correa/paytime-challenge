# **transactions/infra/http/controllers**

A pasta `controllers` é responsável por armazenar os Controladores de Rotas pertinente aos documentos de transações.

# DepositController
Nela serão inseridas as informações `gotoAccountId`, `depositName` e `amount` do corpo da requisição de depósito.
Por sua vez ela executará o serviço `CreateDepositsService` que criará um depósito para uma conta.

# ExtractController
Nela serão inseridas as informações `initialDateDay`, `initialDateMonth` e `initialDateYear` do corpo da requisição de listagem de extrato detalhado, além do `id` da conta que requeriu o extrato.
Por sua vez ela executará o serviço `ListExtractsService` que listará o extrato da conta a partir da data inicial.

# PaymentSlipController
Nela serão inseridas as informações `amount`, data de vencimento (`dueDate`), multa por atraso (`paymentPenalty`), juros (`interest`) e tipo de juros (`interestType`) do corpo da requisição de criação de boleto, além do `id` da conta que requeriu a criação do boleto.
Por sua vez ela executará o serviço `CreatePaymentSlipService` que criará um boleto de pagamento para ser depositado na conta com o `id`.

# TransactionController
Nela serão inseridas as informações `amount` e a conta destinatária da transação (`gotoAccountId`) do corpo da requisição de criação de boleto, além do `id` da conta que requeriu a criação da transação.
Por sua vez ela executará o serviço `CreateTransactionService` que criará uma transação direta para ser depositado na conta com o `gotoAccountId`.
