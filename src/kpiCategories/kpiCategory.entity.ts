import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'kpi_categories' })
class KpiCategory {
  @PrimaryGeneratedColumn()
  public kpi_category_id: number;

  @Column({ unique: true })
  public kpi_category_name: string;

  @Column({ nullable: true })
  public description?: string;
}

export default KpiCategory;
