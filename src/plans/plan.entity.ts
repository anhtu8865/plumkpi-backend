import { Exclude } from 'class-transformer';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import PlanKpiCategories from './planKpiCategories.entity';
import { PlanKpiTemplateDepts } from './planKpiTemplateDepts.entity';
import PlanKpiTemplates from './planKpiTemplates.entity';

@Entity({ name: 'plans' })
class Plan {
  @PrimaryGeneratedColumn()
  public plan_id: number;

  @Column({ unique: true })
  public plan_name: string;

  @Column({ nullable: true })
  public description?: string;

  @Column({ unique: true })
  public year: number;

  @OneToMany(
    () => PlanKpiCategories,
    (plan_kpi_category: PlanKpiCategories) => plan_kpi_category.plan,
  )
  public plan_kpi_categories: PlanKpiCategories[];

  @OneToMany(
    () => PlanKpiTemplates,
    (plan_kpi_templates: PlanKpiTemplates) => plan_kpi_templates.plan,
  )
  public plan_kpi_templates: PlanKpiTemplates[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default Plan;
