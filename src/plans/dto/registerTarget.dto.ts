import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RegisterTargetDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  target: number;
}
