import { Exclude } from 'class-transformer';
import { PlanKpiTemplateDept } from 'src/plans/planKpiTemplateDept.entity';
import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'departments' })
class Dept {
  @PrimaryGeneratedColumn()
  public dept_id: number;

  @Column({ unique: true })
  public dept_name: string;

  @Column({ nullable: true })
  public description?: string;

  @OneToMany(() => User, (user: User) => user.dept)
  public users: User[];

  @OneToOne(() => User, (manager: User) => manager.manage)
  @JoinColumn()
  public manager: User;

  @OneToMany(
    () => PlanKpiTemplateDept,
    (plan_kpi_template_depts: PlanKpiTemplateDept) =>
      plan_kpi_template_depts.dept,
  )
  plan_kpi_template_depts: PlanKpiTemplateDept[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default Dept;
