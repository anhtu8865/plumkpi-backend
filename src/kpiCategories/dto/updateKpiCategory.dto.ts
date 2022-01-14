import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateKpiCategoryDto {
  @IsNumber()
  @IsOptional()
  kpi_category_id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  kpi_category_name: string;
}

export default UpdateKpiCategoryDto;
