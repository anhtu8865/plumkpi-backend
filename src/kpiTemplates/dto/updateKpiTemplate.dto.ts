import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import Aggregation from '../aggregation.enum';
import { Measure } from './createKpiTemplate.dto';

export class UpdateKpiTemplateDto {
  @IsNotEmpty({ message: 'Tên KPI không được để trống' })
  @IsOptional()
  kpi_template_name: string;

  description?: string;

  @IsEnum(Aggregation)
  @IsNotEmpty()
  @IsOptional()
  aggregation?: Aggregation;

  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  @IsOptional()
  unit: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Measure)
  measures?: Measure[];

  @IsNotEmpty({ message: 'Danh mục KPI không được để trống' })
  @IsOptional()
  kpi_category?: KpiCategory;
}

export default UpdateKpiTemplateDto;
