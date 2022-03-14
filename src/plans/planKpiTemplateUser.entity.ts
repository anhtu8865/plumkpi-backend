import { Exclude } from 'class-transformer';
import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import PlanKpiTemplate from './planKpiTemplate.entity';

@Entity({ name: 'plan_kpi_template_users' })
export class PlanKpiTemplateUser {
  @ManyToOne(() => PlanKpiTemplate, {
    primary: true,
  })
  public plan_kpi_template: PlanKpiTemplate;

  @ManyToOne(() => User, {
    primary: true,
  })
  user: User;

  @Column({ nullable: true })
  first_monthly_target: number;

  @Column({ nullable: true })
  second_monthly_target: number;

  @Column({ nullable: true })
  third_monthly_target: number;

  @Column({ nullable: true })
  fourth_monthly_target: number;

  @Column({ nullable: true })
  fifth_monthly_target: number;

  @Column({ nullable: true })
  sixth_monthly_target: number;

  @Column({ nullable: true })
  seventh_monthly_target: number;

  @Column({ nullable: true })
  eighth_monthly_target: number;

  @Column({ nullable: true })
  ninth_monthly_target: number;

  @Column({ nullable: true })
  tenth_monthly_target: number;

  @Column({ nullable: true })
  eleventh_monthly_target: number;

  @Column({ nullable: true })
  twelfth_monthly_target: number;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
