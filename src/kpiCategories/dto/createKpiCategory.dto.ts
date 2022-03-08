import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKpiCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  kpi_category_name: string;

  description?: string;
}

export default CreateKpiCategoryDto;
