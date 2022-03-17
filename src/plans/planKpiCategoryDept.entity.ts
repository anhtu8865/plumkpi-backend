import Dept from 'src/departments/dept.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import PlanKpiCategory from './planKpiCategory.entity';
@Entity({ name: 'plan_kpi_category_depts' })
class PlanKpiCategoryDept {
  @Column({ nullable: true })
  weight: number;

  @ManyToOne(() => PlanKpiCategory, {
    primary: true,
  })
  public plan_kpi_category: PlanKpiCategory;

  @ManyToOne(() => Dept, {
    primary: true,
  })
  public dept: Dept;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default PlanKpiCategoryDept;
