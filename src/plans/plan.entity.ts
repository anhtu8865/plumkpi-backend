import User from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'plans' })
class Plan {
  @PrimaryGeneratedColumn()
  public plan_id: number;

  @Column()
  public plan_name: string;

  @Column({ nullable: true })
  public description?: string;

  @Column({ type: 'date' })
  public start_date: string;

  @Column({ type: 'date' })
  public end_date: string;

  @ManyToOne(() => User, (user: User) => user.plans, { eager: true })
  public user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Plan;
