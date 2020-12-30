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

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'fromAccountId' })
  fromAccountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'gotoAccountId' })
  gotoAccountId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Document;
