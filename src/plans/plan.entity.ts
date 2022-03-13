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
import PlanKpiCategory from './planKpiCategory.entity';
import { PlanKpiTemplateDept } from './planKpiTemplateDept.entity';
import PlanKpiTemplate from './planKpiTemplate.entity';

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
    () => PlanKpiCategory,
    (plan_kpi_category: PlanKpiCategory) => plan_kpi_category.plan,
  )
  public plan_kpi_categories: PlanKpiCategory[];

  @OneToMany(
    () => PlanKpiTemplate,
    (plan_kpi_templates: PlanKpiTemplate) => plan_kpi_templates.plan,
  )
  public plan_kpi_templates: PlanKpiTemplate[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default Plan;
