import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKpiCategoryDto {
  @IsString()
  @IsNotEmpty()
  kpi_category_name: string;
}

export default CreateKpiCategoryDto;
