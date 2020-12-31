import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Account from '@modules/accounts/infra/typeorm/entities/Account';

@Entity('documents')
class Document {
  @PrimaryGeneratedColumn('uuid')
  document: string;

  @Column()
  type: number;

  @Column()
  amount: number;

  @Column()
  paymentStatus: number;

  @Column('timestamp with time zone')
  dueDate: Date;

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
  fromAccount: Account;

  @Column()
  gotoAccountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'gotoAccountId' })
  gotoAccount: Account;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  depositName: string;
}

export default Document;
