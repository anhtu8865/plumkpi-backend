import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
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

export class FileMonthlyTargetDto {
  @Type(() => Number)
  @IsNumber()
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  kpi_template_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;
}

export class DeleteFileMonthlyTargetDto {
  @Type(() => Number)
  @IsNumber()
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  kpi_template_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsNumber()
  file_id: number;
}

export class FileQuarterlyTargetDto {
  @Type(() => Number)
  @IsNumber()
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  kpi_template_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;
}

export class DeleteFileQuarterlyTargetDto {
  @Type(() => Number)
  @IsNumber()
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  kpi_template_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;

  @Type(() => Number)
  @IsNumber()
  file_id: number;
}
