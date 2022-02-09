import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'kpi_categories' })
class KpiCategory {
  @PrimaryGeneratedColumn()
  public kpi_category_id: number;

  @Column({ unique: true })
  public kpi_category_name: string;

  @Column({ nullable: true })
  public description?: string;

  @OneToMany(
    () => KpiTemplate,
    (kpiTemplate: KpiTemplate) => kpiTemplate.kpi_category,
  )
  public kpi_templates: KpiTemplate[];
}

export default KpiCategory;
