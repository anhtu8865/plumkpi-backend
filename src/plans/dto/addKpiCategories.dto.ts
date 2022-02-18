import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddKpiCategoriesDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  plan_id: number;

  @IsNotEmpty()
  kpi_categories: { kpi_category_id: number; weight: number }[];
}

export default AddKpiCategoriesDto;
