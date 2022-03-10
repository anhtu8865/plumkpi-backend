import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { PaginationParams } from 'src/utils/types/paginationParams';

export class KpisOfOneCategoryParams extends PaginationParams {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  kpi_category_id: number;
}
