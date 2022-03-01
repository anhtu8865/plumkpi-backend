import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import PlanKpiTemplates from 'src/plans/planKpiTemplates.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Direction from './direction.enum';
import Frequency from './frequency.enum';
import Aggregation from './aggregation.enum';

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
    enum: Frequency,
    default: Frequency.Daily,
  })
  public frequency: Frequency;

  @Column({
    type: 'enum',
    enum: Direction,
    default: Direction.Up,
  })
  public direction: Direction;

  @Column({
    type: 'enum',
    enum: Aggregation,
    default: Aggregation.Sum,
  })
  public aggregation: Aggregation;

  @Column()
  public unit: string;

  @Column({ nullable: true })
  public formula: string;

  @ManyToOne(
    () => KpiCategory,
    (kpi_category: KpiCategory) => kpi_category.kpi_templates,
    {
      eager: true,
    },
  )
  public kpi_category: KpiCategory;

  @OneToMany(
    () => PlanKpiTemplates,
    (plan_kpi_templates: PlanKpiTemplates) => plan_kpi_templates.kpi_template,
  )
  public plan_kpi_templates: PlanKpiTemplates[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default KpiTemplate;
