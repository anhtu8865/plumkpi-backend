import { Exclude } from 'class-transformer';
import { Dashboard } from 'src/dashboards/dashboard.entity';
import Plan from 'src/plans/plan.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Properties } from './interface/properties.interface';

@Entity({ name: 'charts' })
export class Chart {
  @PrimaryGeneratedColumn()
  chart_id: number;

  @Column()
  chart_name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Dashboard)
  dashboard: Dashboard;

  @ManyToOne(() => Plan)
  plan: Plan;

  @Column({ type: 'jsonb', nullable: true })
  properties: Properties;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
