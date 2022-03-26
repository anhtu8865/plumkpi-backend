import { Exclude } from 'class-transformer';
import Dept from 'src/departments/dept.entity';
import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dashboards' })
export class Dashboard {
  @PrimaryGeneratedColumn()
  dashboard_id: number;

  @Column()
  dashboard_name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Dept)
  dept: Dept;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
