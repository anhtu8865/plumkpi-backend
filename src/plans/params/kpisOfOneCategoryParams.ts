import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { PaginationParams } from 'src/utils/types/paginationParams';

export class KpisOfOneCategoryParams extends PaginationParams {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  kpi_category_id: number;
}

export class KpisOfOneCategoryInDeptParams extends KpisOfOneCategoryParams {
  @Type(() => Number)
  @IsNumber()
  dept_id: number;
}

export class KpisOfOneCategoryOfUserParams extends KpisOfOneCategoryParams {
  @Type(() => Number)
  @IsNumber()
  user_id: number;
}
