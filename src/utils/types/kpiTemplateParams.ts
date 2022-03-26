import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationParams } from './paginationParams';

export class KpiTemplateParams extends PaginationParams {
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  kpi_category_id: number;
}
