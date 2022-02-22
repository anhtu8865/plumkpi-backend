import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import Plan from './plan.entity';

@Entity({ name: 'plan_kpi_templates' })
class PlanKpiTemplates {
  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  target: number;

  @Column({ nullable: true })
  red_threshold: number;

  @Column({ nullable: true })
  yellow_threshold: number;

  @Column({ nullable: true })
  green_threshold: number;

  @Column({ nullable: true })
  approve_registration: boolean;

  @ManyToOne(() => Plan, (plan: Plan) => plan.plan_kpi_templates, {
    primary: true,
  })
  public plan: Plan;

  @ManyToOne(
    () => KpiTemplate,
    (kpi_template: KpiTemplate) => kpi_template.plan_kpi_templates,
    {
      primary: true,
      eager: true,
    },
  )
  public kpi_template: KpiTemplate;
}

export default PlanKpiTemplates;
