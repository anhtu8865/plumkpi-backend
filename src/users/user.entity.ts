import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import Dept from 'src/departments/dept.entity';
import Role from './role.enum';

@Entity({ name: 'users' })
class User {
  @PrimaryGeneratedColumn()
  public user_id: number;

  @Column()
  public user_name: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  @Exclude()
  public password: string;

  // @Column()
  // public role: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Employee,
  })
  public role: Role;

  @Column({ default: true })
  public is_active: boolean;

  @ManyToOne(() => Dept, (dept: Dept) => dept.users, {
    eager: true,
  })
  public dept: Dept;
}

export default User;
