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

@Entity({ name: 'notifs' })
export class Notif {
  @PrimaryGeneratedColumn()
  notif_id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'date' })
  time: string;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
