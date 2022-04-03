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
import { ChartType, Properties } from './interface/properties.interface';

@Entity({ name: 'charts' })
export class Chart {
  @PrimaryGeneratedColumn()
  chart_id: number;

  @Column({
    type: 'enum',
    enum: ChartType,
    default: ChartType.Chart,
  })
  chart_type: ChartType;

  @ManyToOne(() => Dashboard)
  dashboard: Dashboard;

  @Column({ type: 'jsonb' })
  properties: Properties;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
