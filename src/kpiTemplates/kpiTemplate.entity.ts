import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import PlanKpiTemplate from 'src/plans/planKpiTemplate.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Aggregation from './aggregation.enum';
import { Exclude } from 'class-transformer';
import { Measures } from './interface/measures.interface';

@Entity({ name: 'kpi_templates' })
class KpiTemplate {
  @PrimaryGeneratedColumn()
  public kpi_template_id: number;

  @Column({ unique: true })
  public kpi_template_name: string;

  @Column({ nullable: true })
  public description: string;

  @Column({
    type: 'enum',
    enum: Aggregation,
    default: Aggregation.Sum,
  })
  public aggregation: Aggregation;

  @Column()
  public unit: string;

  @Column({ type: 'jsonb', default: { items: [] } })
  measures: Measures;

  @ManyToOne(
    () => KpiCategory,
    (kpi_category: KpiCategory) => kpi_category.kpi_templates,
    {
      eager: true,
    },
  )
  public kpi_category: KpiCategory;

  @OneToMany(
    () => PlanKpiTemplate,
    (plan_kpi_templates: PlanKpiTemplate) => plan_kpi_templates.kpi_template,
  )
  public plan_kpi_templates: PlanKpiTemplate[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

export default KpiTemplate;
