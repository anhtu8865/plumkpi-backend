import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteKpiCategoryParams {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  kpi_category_id: number;
}
