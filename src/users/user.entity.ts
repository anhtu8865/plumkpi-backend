import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
class User {
  @PrimaryGeneratedColumn()
  public user_id?: number;

  @Column()
  public user_name: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  @Exclude()
  public password: string;

  @Column()
  public role: string;

  @Column({ default: true })
  public is_active: boolean;
}

export default User;
