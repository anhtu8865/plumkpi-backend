import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'departments' })
class Dept {
  @PrimaryGeneratedColumn()
  public dept_id?: number;

  @Column({ unique: true })
  public dept_name: string;
}

export default Dept;
