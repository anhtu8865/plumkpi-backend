import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import ApproveRegistration from '../approveRegistration.enum';

export class ApproveQuarterlyTargetDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNumber()
  @IsNotEmpty()
  dept_id: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  quarter: number;

  @IsEnum(ApproveRegistration)
  approve: ApproveRegistration;
}
