import { Exclude } from 'class-transformer';
import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'cruds' })
export class Crud {
  @PrimaryGeneratedColumn()
  crud_id: number;

  @Column()
  crud_name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
