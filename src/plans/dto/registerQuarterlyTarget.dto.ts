import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class RegisterQuarterlyTargetDto {
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

  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;
}
