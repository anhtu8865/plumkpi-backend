import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RegisterQuarterlyTargetDto {
  @IsNumber()
  plan_id: number;

  @IsNumber()
  kpi_template_id: number;

  @IsNumber()
  @IsOptional()
  target: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;
}

export class EnterDataQuarterlyTargetDto {
  @IsNumber()
  plan_id: number;

  @IsNumber()
  kpi_template_id: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;

  @IsNumber()
  @IsOptional()
  value: number;

  @IsString()
  @IsOptional()
  note: string;
}

export class EnterDataMonthlyTargetDto {
  @IsNumber()
  plan_id: number;

  @IsNumber()
  kpi_template_id: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @IsOptional()
  value: number;

  @IsString()
  @IsOptional()
  note: string;
}
