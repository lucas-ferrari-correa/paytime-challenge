# **transactions/services**
Nesta pasta estão armazenados todos os serviços e testes referentes ao domínio de documentos de transações.

Todos os testes estão com suas respectivas descrições.

# ShowPaymentSlipService
Serviço de visualização do boleto de pagamento.
Ela utilizará o repositório de Contas (`AccountsRepository`) e o repositório de documentos (`DocumentsRepository`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  document: string;
}
```

Inicialmente ela irá verificar se o documento existe no BD através do `document` e também se ele possui como `type = 2` indicando que é um boleto de pagamento.

Em seguida irá buscar a conta destinatária do pagamento do boleto para verificar se a mesma ainda existe.

Depois destas verificações ela irá exibir o boleto com o montante final ajustado (`finalAmount`). Então será necessário verificar se o boleto passou da data de vencimento (`dueDate`) para ser aplicado o `paymentPenalty` e qual é a o tipo de juros (`interestType`), se é diário (1), mensal (2) ou anual (3). O valor do juros será aplicado ao montante inicial do boleto (`amount`).


# PayPaymentSlipService
Serviço de pagamento de boleto de pagamento.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de documentos (`DocumentsRepository`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  id: string;
  document: string;
}
```

Inicialmente ela irá verificar se o documento existe no BD através do `document`, também se ele possui como `type = 2` indicando que é um boleto de pagamento, além de verificar se o boleto está sendo pago pela própria conta que gerou o boleto e se ele mesmo já foi pago.

Em seguida irá buscar a conta destinatária do pagamento do boleto para verificar se a mesma ainda existe.

Também é feita a verificação se a conta que irá pagar o boleto possui montante suficiente para pagar o boleto.

Depois destas verificações ela irá exibir o boleto com o montante final ajustado (`finalAmount`), fazendo as devidas adições e subtrações nas contas envolvidas.

Então será necessário verificar se o boleto passou da data de vencimento (`dueDate`) para ser aplicado o `paymentPenalty` e qual é a o tipo de juros (`interestType`), se é diário (1), mensal (2) ou anual (3). O valor do juros será aplicado ao montante inicial do boleto (`amount`). Caso o boleto tenha algum tipo de penalidade, também é feita uma verificação se a conta que irá pagar o boleto possui montante suficiente para pagá-lo.

Nas duas possíveis definições as contas de destino do pagamento e origem terão seus valores de `amount` atualizados no BD e também nas suas respectivas listagens de cache.


# CreatePaymentSlipService
Serviço de criação de boleto de pagamento.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de documentos (`DocumentsRepository`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  amount: number;
  dueDate: Date;
  paymentPenalty: number;
  interest: number;
  interestType: number;
  gotoId: string;
}
```

Inicialmente ela verificará se o id da conta de destino (`gotoId`) é de alguma conta existente no BD. Depois verificará se o tipo de juros (`interestType`) foi colocado corretamente, só podendo ser `[1, 2, 3]`, além de verificar se o juros (`interest`) é positivo.

Após isso através do `createPaymentSlip` é criado um documento no BD de boleto de pagamento.


# CreateTransactionService
Serviço de criação de transação direta entre contas.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de documentos (`DocumentsRepository`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  gotoAccountId: string;
  amount: number;
  fromId: string;
}
```

Inicialmente ela verificará se o id da conta de origem (`fromId`) é de alguma conta existente no BD. Depois verificará se a conta de origem possui montante (`amount`) suficiente para realizar a transação. Também se verifica se a conta destinatário (`gotoAccountId`) existe no BD.

Após isso através do `createTransaction` é criado um documento no BD de transação direta. Após isso os valores de `amount` de ambas as contas são atualizadas e salvas no BD e no cache.


# CreateDepositsService
Serviço de criação de depósito em dinheiro.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de documentos (`DocumentsRepository`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  gotoAccountId: string;
  depositName: string;
  amount: number;
}
```

Inicialmente ela verificará se o id da conta de destino (`gotoAccountId`) é de alguma conta existente no BD.

Após isso através do `createDeposit` é criado um documento no BD de depósito em dinheiro. Após isso os valores de `amount` da conta de destino é atualizada e salva no BD e no cache.


# CreateTransactionService
Serviço de criação de transação direta entre contas.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de documentos (`DocumentsRepository`) e o provedor de Cache (`CacheProvider`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  gotoAccountId: string;
  amount: number;
  fromId: string;
}
```

Inicialmente ela verificará se o id da conta de origem (`fromId`) é de alguma conta existente no BD. Depois verificará se a conta de origem possui montante (`amount`) suficiente para realizar a transação. Também se verifica se a conta destinatário (`gotoAccountId`) existe no BD.

Após isso através do `createTransaction` é criado um documento no BD de transação direta. Após isso os valores de `amount` de ambas as contas são atualizadas e salvas no BD e no cache.


# ListExtractsService
Serviço de listagem de extrato.
Ela utilizará o repositório de Contas (`AccountsRepository`), o repositório de documentos (`DocumentsRepository`) através das ClassDecorators `@inject`

Ela é alimentada através da interface `IRequest`

```
interface IRequest {
  initialDateDay: number;
  initialDateMonth: number;
  initialDateYear: number;
  id: string;
}
```

Além disso ela possui como resposta a interface `IResponse`

```
interface IResponse {
  accountId: string;
  accountName: string;
  initialDate: Date;
  initialAmountAccount: number;
  finalAmountAccount: number;
  document: IDocument[];
}
```

Inicialmente ela verificará se o `id` da conta requisidora é de alguma conta existente no BD.

Ela então criará uma data de comparação `compareDate` para verificar quais documentos serão listados.

```
const compareDate = new Date(
      exctractData.initialDateYear,
      exctractData.initialDateMonth - 1,
      exctractData.initialDateDay,
    );
```

Utilizando os `findAllEntriesByDate` e `findAllExitsByDate` é possível saber quais documentos já pagos de entradas e saídas estão relacionados com a conta para a data de comparação.

Todos estes documentos são agrupados em um Array de `Document` e organizados através de sua data de pagamento

```
const allDocuments: Document[] = Array.prototype.concat(
      entriesDocuments,
      exitsDocuments,
    );

allDocuments.sort((a: Document, b: Document) => {
      if (isBefore(a.paymentDate, b.paymentDate)) {
        return -1;
      }
      if (isAfter(a.paymentDate, b.paymentDate)) {
        return 1;
      }
      return 0;
    });
```

Na listagem do extrato a intenção é mostrar o montante inicial da conta (`initialAmountAccount`) e o montante final da conta (`finalAmountAccount`) relativo ao período de extrato e também todas as variações destes montantes de contas em cada um dos documentos.

O valor `finalAmountAccount` já é conhecido, pois é o valor de `amount` da própria conta. A partir dele será encontrado o `initialAmountAccount` fazendo operações reversas de acordo com os documentos de origem e saída.

Para isso foi implementado um reduce, e nesse caso foi utilizado uma biblioteca chamada `awaity` para utilizarmos async/await dentro de um reduce mais facilmente.

Para tal foram utilizadas duas interfaces chamadas `IAccumulator` e `IDocument`

```
interface IAccumulator {
  initialAmount: number;
  finalAmountAccount: number;
  documentsOrganized: IDocument[];
}

interface IDocument extends Document {
  initialAmountAccount: number;
  fromAccountName?: string;
  gotoAccountName?: string;
  finalAmountAccount: number;
}
```

Elas serão utilizadas para que se possa dentro de um reduce ir armazendo os valores acumulados de `finalAmountAccount` e `initialAmountAccount` dentro do Array de documentos.

```
const reversedSortedAllDocuments: IAccumulator = await reduce(
      allDocuments.reverse(), //Como a operação será reversa, é necessário inverter a ordem dos documentos. O primeiro documento será o que tiver a data de pagamento mais distante.
      async (accumulator: IAccumulator, document: Document) => {
        if (document.fromAccountId === account.id) {
          //Neste caso quando o documento for um documento de saída, o finalAmountAccount será subtraído do finalAmount do documento. E o initialAmount será somado do finalAmount do documento
          accumulator.finalAmountAccount =
            Number(accumulator.finalAmountAccount) -
            Number(document.finalAmount);
          accumulator.initialAmount =
            Number(accumulator.initialAmount) + Number(document.finalAmount);

          const exitDocument = await this.accountsRepository
            .findById(document.gotoAccountId)
            .then(gotoAccount => {
              const response = {
                ...document,
                initialAmountAccount: accumulator.initialAmount,
                finalAmountAccount:
                  Number(accumulator.initialAmount) -
                  Number(document.finalAmount),
                finalAmount: Number(document.amount) * -1,
                fromAccountName: account.accountName,
                gotoAccountName: gotoAccount?.accountName,
              };

              return response;
            });

          accumulator.documentsOrganized.push(exitDocument);

          return accumulator;
        }

        if (document.gotoAccountId === account.id) {
          //Neste caso quando o documento for um documento de entrada, o finalAmountAccount será somado do finalAmount do documento. E o initialAmount será subtraído do finalAmount do documento
          accumulator.finalAmountAccount =
            Number(accumulator.finalAmountAccount) +
            Number(document.finalAmount);
          accumulator.initialAmount =
            Number(accumulator.initialAmount) - Number(document.finalAmount);

          const entryDocument = await this.accountsRepository
            .findById(document.fromAccountId)
            .then(fromAccount => {
              const response = {
                ...document,
                initialAmountAccount: accumulator.initialAmount,
                finalAmountAccount:
                  Number(accumulator.initialAmount) +
                  Number(document.finalAmount),
                fromAccountName: fromAccount?.accountName,
                gotoAccountName: account.accountName,
              };

              return response;
            });

          accumulator.documentsOrganized.push(entryDocument);

          return accumulator;
        }

        accumulator.documentsOrganized.push();

        return accumulator;
      },
      {
        initialAmount: Number(account.amount),
        finalAmountAccount: 0,
        documentsOrganized: [] as IDocument[],
      },
    );
```
