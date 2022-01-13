import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'departments' })
class Dept {
  @PrimaryGeneratedColumn()
  public dept_id?: number;

  @Column({ unique: true })
  public dept_name: string;

  @Column({ nullable: true })
  public description?: string;
}

export default Dept;
