import User from 'src/users/user.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeptDto {
  @IsNumber()
  @IsOptional()
  dept_id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  dept_name: string;

  @IsString()
  @IsOptional()
  description: string;

  // @IsNotEmpty()
  // @IsOptional()
  // manager: User;
}

export default UpdateDeptDto;
