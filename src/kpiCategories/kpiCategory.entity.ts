import Plan from 'src/plans/plan.entity';
import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import PlanKpiCategories from 'src/plans/planKpiCategories.entity';

@Entity({ name: 'kpi_categories' })
class KpiCategory {
  @PrimaryGeneratedColumn()
  public kpi_category_id: number;

  @Column({ unique: true })
  public kpi_category_name: string;

  @Column({ nullable: true })
  public description?: string;

  @OneToMany(
    () => KpiTemplate,
    (kpiTemplate: KpiTemplate) => kpiTemplate.kpi_category,
  )
  public kpi_templates: KpiTemplate[];

  @OneToMany(
    () => PlanKpiCategories,
    (plan_kpi_category: PlanKpiCategories) => plan_kpi_category.kpi_categories,
  )
  public plan_kpi_categories: PlanKpiCategories[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default KpiCategory;
