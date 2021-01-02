# **accounts/infra/typeorm**
Dentro desta pasta haverão mais 2 pastas responsáveis pelas entidades e repositório de consulta das tabelas do BD criadas através do TypeORM.
- entities: onde estão armazenadas os arquivos de entidades das tabelas.
- typeorm: onde estão armazenadas os arquivos de repositório de consulta das tabelas

# accounts/infra/typeorm/entities
Existem dois arquivos de entidades:
- Account: responsável pela definição da entidade `Account` que será armazenada na tabela `accounts` do BD.
- AccountToken: responsável pela definição da entidade `AccountToken` que será armazenada na tabela `account_tokens` do BD.

Ressalta-se que em cada uma delas foram utilizados ClassDecorators do TypeORM no intuito de facilitar o relacionamento das tabelas e colunas do BD com as configurações de entidade. Tomemos como exemplo a entidade `Account`

```
@Entity('accounts') //Indica que a entidade se relacionará com a tabela 'accounts'
class Account {
  @PrimaryGeneratedColumn('uuid') // Será gerado uma string uuid na criação da conta.
  id: string;

  @Column()
  accountName: string;

  @Column()
  email: string;

  @Column()
  @Exclude() // Ao ser utilizado o método classToClass como response das requisições, esta coluna será omitida por ser sensível.
  password: string;

  @Column()
  cpf: string;

  @Column()
  cnpj: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountUserId' })
  // Para contas estabelecimento. Ele estabelece uma relação de Muitos-para-Um com a tabela 'accounts'.
  accountUserId: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```
