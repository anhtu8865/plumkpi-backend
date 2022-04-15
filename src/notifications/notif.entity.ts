import { Exclude } from 'class-transformer';
import Role from 'src/users/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'notifs' })
export class Notif {
  @PrimaryGeneratedColumn()
  notif_id: number;

  @Column()
  content: string;

  @Column()
  day: number;

  @Column()
  month: number;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
