import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ComponentStatus, KitCondition } from '../../../shared/src/types';
import { Kit } from './Kit';

@Entity('kit_components')
export class KitComponent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @ManyToOne(() => Kit, kit => kit.components)
  kit!: Kit;

  @Column({
    type: 'enum',
    enum: ComponentStatus,
    default: ComponentStatus.PRESENT
  })
  status!: ComponentStatus;

  @Column({
    type: 'enum',
    enum: KitCondition,
    default: KitCondition.EXCELLENT
  })
  condition!: KitCondition;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}