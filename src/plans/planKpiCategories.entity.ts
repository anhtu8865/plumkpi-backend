import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import Plan from './plan.entity';
@Entity({ name: 'plan_kpi_categories' })
class PlanKpiCategories {
  @Column()
  weight: number;

  @ManyToOne(() => Plan, (plan: Plan) => plan.plan_kpi_categories, {
    primary: true,
  })
  public plan: Plan;

  @ManyToOne(
    () => KpiCategory,
    (kpiCategory: KpiCategory) => kpiCategory.plan_kpi_categories,
    {
      primary: true,
      eager: true,
    },
  )
  public kpi_category: KpiCategory;
}

export default PlanKpiCategories;
