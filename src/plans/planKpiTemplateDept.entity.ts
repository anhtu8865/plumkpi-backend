import { Exclude } from 'class-transformer';
import Dept from 'src/departments/dept.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { RegisterTarget } from './interfaces/register-target.interface';

import PlanKpiTemplate from './planKpiTemplate.entity';

@Entity({ name: 'plan_kpi_template_depts' })
export class PlanKpiTemplateDept {
  @Column({ nullable: true })
  target: number;

  @Column({ nullable: true })
  weight: number;

  @ManyToOne(() => PlanKpiTemplate, {
    primary: true,
  })
  public plan_kpi_template: PlanKpiTemplate;

  @ManyToOne(() => Dept, (dept: Dept) => dept.plan_kpi_template_depts, {
    primary: true,
  })
  dept: Dept;

  @Column({ type: 'jsonb', nullable: true })
  first_quarterly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  second_quarterly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  third_quarterly_target: RegisterTarget;

  @Column({ type: 'jsonb', nullable: true })
  fourth_quarterly_target: RegisterTarget;

  @Column({ type: 'date', nullable: true })
  first_quarterly_register_day: string;

  @Column({ type: 'date', nullable: true })
  second_quarterly_register_day: string;

  @Column({ type: 'date', nullable: true })
  third_quarterly_register_day: string;

  @Column({ type: 'date', nullable: true })
  fourth_quarterly_register_day: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
