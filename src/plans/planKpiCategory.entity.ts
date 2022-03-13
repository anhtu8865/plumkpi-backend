import { Exclude } from 'class-transformer';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import Plan from './plan.entity';
@Entity({ name: 'plan_kpi_categories' })
class PlanKpiCategory {
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
      // eager: true,
    },
  )
  public kpi_category: KpiCategory;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default PlanKpiCategory;
