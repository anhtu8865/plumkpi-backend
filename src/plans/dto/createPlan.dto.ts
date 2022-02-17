import User from 'src/users/user.entity';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  plan_name: string;

  @IsString()
  @IsNotEmpty()
  start_date: string;

  @IsString()
  @IsNotEmpty()
  end_date: string;
}

export default CreatePlanDto;
