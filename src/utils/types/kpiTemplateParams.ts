import Role from 'src/users/role.enum';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationParams } from './paginationParams';

export class KpiTemplateParams extends PaginationParams {
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  kpi_category_id: number;
}
