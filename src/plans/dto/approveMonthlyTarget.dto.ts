import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import ApproveRegistration from '../approveRegistration.enum';

export class ApproveMonthlyTargetDto {
  @IsNumber()
  plan_id: number;

  @IsNumber()
  kpi_template_id: number;

  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  @IsArray()
  user_ids: number[];

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsEnum(ApproveRegistration)
  approve: ApproveRegistration;
}
