import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TransactionStatus, KitCondition } from '../../../shared/src/types';
import { StudentAccount } from './StudentAccount';
import { Kit } from './Kit';

@Entity('borrow_transactions')
export class BorrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => StudentAccount)
  student!: StudentAccount;

  @ManyToOne(() => Kit)
  kit!: Kit;

  @Column()
  borrowDate!: Date;

  @Column()
  dueDate!: Date;

  @Column({ nullable: true })
  returnDate?: Date;

  @Column({
    type: 'enum',
    enum: KitCondition
  })
  initialCondition!: KitCondition;

  @Column({
    type: 'enum',
    enum: KitCondition,
    nullable: true
  })
  returnCondition?: KitCondition;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.ACTIVE
  })
  status!: TransactionStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}