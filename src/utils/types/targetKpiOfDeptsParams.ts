import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TargetKpiOfDeptsParams {
  @Type(() => Number)
  @IsNumber()
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  kpi_template_id: number;
}
