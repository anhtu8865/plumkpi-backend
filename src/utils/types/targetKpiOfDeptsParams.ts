import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TargetKpiOfDeptsParams {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  kpi_template_id: number;
}
