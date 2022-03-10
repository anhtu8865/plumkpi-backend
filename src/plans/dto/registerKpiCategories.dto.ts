import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class KpiCategoriesDto {
  @IsNumber()
  @IsNotEmpty()
  kpi_category_id: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
}

export class RegisterKpiCategoriesDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiCategoriesDto)
  kpi_categories: KpiCategoriesDto[];
}

export default RegisterKpiCategoriesDto;
