import Dept from 'src/departments/dept.entity';
import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import Plan from './plan.entity';
import PlanKpiTemplates from './planKpiTemplates.entity';

@Entity({ name: 'plan_kpi_template_depts' })
export class PlanKpiTemplateDepts {
  @Column({ nullable: true })
  target: number;

  @ManyToOne(() => PlanKpiTemplates, {
    primary: true,
  })
  public plan_kpi_template: PlanKpiTemplates;

  @ManyToOne(() => Dept, (dept: Dept) => dept.plan_kpi_template_depts, {
    primary: true,
  })
  dept: Dept;
}
