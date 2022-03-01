import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlanDto {
  @IsNumber()
  @IsOptional()
  plan_id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  plan_name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  start_date: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  end_date: string;
}

export default UpdatePlanDto;
