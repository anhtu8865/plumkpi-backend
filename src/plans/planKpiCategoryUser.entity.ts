import User from 'src/users/user.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import PlanKpiCategory from './planKpiCategory.entity';
@Entity({ name: 'plan_kpi_category_users' })
class PlanKpiCategoryUser {
  @Column({ nullable: true })
  weight: number;

  @ManyToOne(() => PlanKpiCategory, {
    primary: true,
  })
  public plan_kpi_category: PlanKpiCategory;

  @ManyToOne(() => User, {
    primary: true,
  })
  public user: User;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default PlanKpiCategoryUser;
