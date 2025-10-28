import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BorrowTransaction } from './BorrowTransaction';
import { AccountStatus, AccountFlag } from '../shared/src/types';

@Entity('student_accounts')
export class StudentAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  studentId!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE
  })
  status!: AccountStatus;

  @Column('simple-array')
  flags!: AccountFlag[];

  @OneToMany(() => BorrowTransaction, (transaction) => transaction.student)
  transactions!: BorrowTransaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
