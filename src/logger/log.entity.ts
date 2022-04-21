import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'logs' })
class Log {
  @PrimaryGeneratedColumn()
  public log_id: number;

  @Column({ nullable: true })
  public context: string;

  @Column({ nullable: true })
  public message: string;

  @Column({ nullable: true })
  public level: string;

  @CreateDateColumn()
  creationDate: Date;
}

export default Log;
