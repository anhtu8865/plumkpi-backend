import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateKpiCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plan_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  kpi_category_id: number;
}

export default UpdateKpiCategoryDto;
