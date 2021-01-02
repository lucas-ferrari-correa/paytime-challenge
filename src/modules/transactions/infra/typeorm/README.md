# **transactions/infra/typeorm**
Dentro desta pasta haverão mais 2 pastas responsáveis pelas entidades e repositório de consulta das tabelas do BD criadas através do TypeORM.
- entities: onde estão armazenadas os arquivos de entidades das tabelas.
- typeorm: onde estão armazenadas os arquivos de repositório de consulta das tabelas

# transactions/infra/typeorm/entities
Existem um arquivo de entidade:
- Account: responsável pela definição da entidade `Document` que será armazenada na tabela `documents` do BD.

Ressalta-se que em cada uma delas foram utilizados ClassDecorators do TypeORM no intuito de facilitar o relacionamento das tabelas e colunas do BD com as configurações de entidade. Tomemos como exemplo a entidade `Document`

```
@Entity('documents') //Indica que a entidade se relacionará com a tabela 'documents'
class Document {
  @PrimaryGeneratedColumn('uuid') // Será gerado uma string uuid na criação do documento de transação.
  document: string;

  @Column()
  type: number;

  @Column()
  amount: number;

  @Column()
  paymentStatus: number;

  @Column('timestamp with time zone')
  dueDate: Date;

  @Column('timestamp with time zone')
  paymentDate: Date;

  @Column()
  paymentPenalty: number;

  @Column()
  interest: number;

  @Column()
  interestType: number;

  @Column()
  finalAmount: number;

  @Column()
  fromAccountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'fromAccountId' })
  // Ele estabelece uma relação de Muitos-para-Um com a tabela 'accounts'. No caso ela está ligando todos os documentos pertinentes a uma conta remetente.
  fromAccount: Account;

  @Column()
  gotoAccountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'gotoAccountId' })
  // Ele estabelece uma relação de Muitos-para-Um com a tabela 'accounts'. No caso ela está ligando todos os documentos pertinentes a uma conta destinatário.
  gotoAccount: Account;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  depositName: string;
}
```
