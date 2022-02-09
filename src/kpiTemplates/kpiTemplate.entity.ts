import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Direction from './direction.enum';
import Frequency from './frequency.enum';

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
}

export default KpiTemplate;
