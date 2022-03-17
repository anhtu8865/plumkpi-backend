import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class KpiCategoryDto {
  @IsNumber()
  kpi_category_id: number;

  @IsNumber()
  weight: number;
}

export class KpiCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiCategoryDto)
  kpi_categories: KpiCategoryDto[];
}

export class RegisterKpiCategoriesDto {
  @IsNumber()
  plan_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiCategoryDto)
  kpi_categories: KpiCategoryDto[];
}

export default RegisterKpiCategoriesDto;
