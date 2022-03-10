import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import ApproveRegistration from './approveRegistration.enum';
import Plan from './plan.entity';

@Entity({ name: 'plan_kpi_templates' })
class PlanKpiTemplates {
  @Column()
  weight: number;

  // @Column({ nullable: true })
  // target: number;

  // @Column({ nullable: true })
  // red_threshold: number;

  // @Column({ nullable: true })
  // yellow_threshold: number;

  // @Column({ nullable: true })
  // green_threshold: number;

  // @Column({
  //   type: 'enum',
  //   enum: ApproveRegistration,
  //   default: ApproveRegistration.None,
  // })
  // approve_registration: ApproveRegistration;

  @ManyToOne(() => Plan, (plan: Plan) => plan.plan_kpi_templates, {
    primary: true,
  })
  public plan: Plan;

  @ManyToOne(
    () => KpiTemplate,
    (kpi_template: KpiTemplate) => kpi_template.plan_kpi_templates,
    {
      primary: true,
      // eager: true,
    },
  )
  public kpi_template: KpiTemplate;
}

export default PlanKpiTemplates;
