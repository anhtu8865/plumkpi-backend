import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude, Transform, Type } from 'class-transformer';
import Dept from 'src/departments/dept.entity';
import Role from './role.enum';
import PublicFile from 'src/files/publicFile.entity';
import Gender from './gender.enum';
import Plan from 'src/plans/plan.entity';

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

  @ManyToOne(() => Dept, (dept: Dept) => dept.users, { eager: true })
  public dept: Dept;

  @JoinColumn()
  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
  })
  public avatar?: PublicFile;

  @Column({ unique: true, nullable: true })
  public phone: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.None,
  })
  public gender: Gender;

  @Column({ nullable: true })
  public address: string;

  @Column({ type: 'date', nullable: true })
  public dob: string;

  @OneToOne(() => Dept, (manage: Dept) => manage.manager, { eager: true })
  public manage: Dept;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;

  // @DeleteDateColumn()
  // public deletedDate: Date;
}

export default User;
