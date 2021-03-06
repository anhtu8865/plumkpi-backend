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
import PlanKpiCategory from 'src/plans/planKpiCategory.entity';
import { Exclude } from 'class-transformer';

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
    () => PlanKpiCategory,
    (plan_kpi_category: PlanKpiCategory) => plan_kpi_category.kpi_category,
  )
  public plan_kpi_categories: PlanKpiCategory[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default KpiCategory;
