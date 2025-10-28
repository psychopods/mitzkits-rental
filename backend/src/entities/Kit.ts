import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { KitStatus, KitCondition } from '../shared/src/types';
import { KitComponent } from './KitComponent';

@Entity('kits')
export class Kit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @OneToMany(() => KitComponent, component => component.kit)
  components!: KitComponent[];

  @Column({
    type: 'enum',
    enum: KitStatus,
    default: KitStatus.AVAILABLE
  })
  status!: KitStatus;

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
