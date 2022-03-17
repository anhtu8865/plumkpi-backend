import Dept from 'src/departments/dept.entity';
import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RegisterTarget } from './interfaces/register-target.interface';
import Plan from './plan.entity';
import PlanKpiTemplate from './planKpiTemplate.entity';

@Entity({ name: 'plan_kpi_template_depts' })
export class PlanKpiTemplateDept {
  @Column({ nullable: true })
  target: number;

  @Column({ nullable: true })
  weight: number;

  @ManyToOne(() => PlanKpiTemplate, {
    primary: true,
  })
  public plan_kpi_template: PlanKpiTemplate;

  @ManyToOne(() => Dept, (dept: Dept) => dept.plan_kpi_template_depts, {
    primary: true,
  })
  dept: Dept;

  @Column({ type: 'jsonb', nullable: true })
  first_quarterly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  second_quarterly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  third_quarterly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  fourth_quarterly_target: RegisterTarget;
}
