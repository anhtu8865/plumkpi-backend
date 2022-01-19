import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import Dept from 'src/departments/dept.entity';
import Role from './role.enum';
import PublicFile from 'src/files/publicFile.entity';

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

  @JoinColumn()
  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
  })
  public avatar?: PublicFile;
}

export default User;
