import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
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

  @OneToOne(() => User, (manager: User) => manager.manage)
  @JoinColumn()
  public manager: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Dept;
