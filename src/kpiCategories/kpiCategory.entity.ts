import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default KpiCategory;
