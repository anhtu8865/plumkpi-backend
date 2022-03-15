import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class RegisterMonthlyTargetByEmployeeDto {
  @IsNumber()
  plan_id: number;

  @IsNumber()
  kpi_template_id: number;

  @IsNumber()
  @IsOptional()
  target: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;
}
