import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'departments' })
class Dept {
  @PrimaryGeneratedColumn()
  public dept_id: number;

  @Column({ unique: true })
  public dept_name: string;

  @Column({ nullable: true })
  public description?: string;

  @OneToMany(() => User, (user: User) => user.dept)
  public users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Dept;
