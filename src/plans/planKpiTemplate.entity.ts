import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import Plan from './plan.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'plan_kpi_templates' })
class PlanKpiTemplate {
  @Column()
  weight: number;

  @Column({ nullable: true })
  target: number;

  @ManyToOne(() => Plan, (plan: Plan) => plan.plan_kpi_templates, {
    primary: true,
  })
  public plan: Plan;

  @ManyToOne(
    () => KpiTemplate,
    (kpi_template: KpiTemplate) => kpi_template.plan_kpi_templates,
    {
      primary: true,
    },
  )
  public kpi_template: KpiTemplate;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default PlanKpiTemplate;
