import { Exclude } from 'class-transformer';
import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { RegisterTarget } from './interfaces/register-target.interface';
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

  @Column({ type: 'jsonb', nullable: true })
  first_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  second_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  third_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  fourth_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  fifth_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  sixth_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  seventh_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  eighth_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  ninth_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  tenth_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  eleventh_monthly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  twelfth_monthly_target: RegisterTarget;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
