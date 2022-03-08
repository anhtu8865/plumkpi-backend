import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateKpiCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsOptional()
  kpi_category_name?: string;

  description?: string;
}

export default UpdateKpiCategoryDto;
