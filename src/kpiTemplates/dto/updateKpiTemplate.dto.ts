import { IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import Aggregation from '../aggregation.enum';
import Direction from '../direction.enum';
import Frequency from '../frequency.enum';

export class UpdateKpiTemplateDto {
  @IsNotEmpty({ message: 'Tên KPI không được để trống' })
  @IsOptional()
  kpi_template_name: string;

  description?: string;

  @IsNotEmpty()
  @IsOptional()
  frequency?: Frequency;

  @IsNotEmpty()
  @IsOptional()
  direction?: Direction;

  @IsNotEmpty()
  @IsOptional()
  aggregation?: Aggregation;

  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  @IsOptional()
  unit: string;

  @IsNotEmpty({ message: 'Công thức không được để trống' })
  @IsOptional()
  formula?: string;

  @IsNumber()
  @Min(0, { message: 'Red threshold phải lớn hơn bằng 0%' })
  @Max(100, { message: 'Red threshold phải nhỏ hơn bằng 100%' })
  @IsNotEmpty({ message: 'Red threshold không được để trống' })
  @IsOptional()
  red_threshold?: number;

  @IsNumber()
  @Min(0, { message: 'Red yellow threshold phải lớn hơn bằng 0%' })
  @Max(100, { message: 'Red yellow threshold phải nhỏ hơn bằng 100%' })
  @IsNotEmpty({ message: 'Red Yellow threshold không được để trống' })
  @IsOptional()
  red_yellow_threshold?: number;

  @IsNumber()
  @Min(0, { message: 'Yellow green threshold phải lớn hơn bằng 0%' })
  @Max(100, { message: 'Yellow green threshold phải nhỏ hơn bằng 100%' })
  @IsNotEmpty({ message: 'Yellow Green threshold không được để trống' })
  @IsOptional()
  yellow_green_threshold?: number;

  @IsNumber()
  @Min(0, { message: 'Green threshold phải lớn hơn bằng 0%' })
  @Max(100, { message: 'Green threshold phải nhỏ hơn bằng 100%' })
  @IsNotEmpty({ message: 'Green threshold không được để trống' })
  @IsOptional()
  green_threshold?: number;

  @IsNotEmpty({ message: 'Danh mục KPI không được để trống' })
  @IsOptional()
  kpi_category: KpiCategory;
}

export default UpdateKpiTemplateDto;
