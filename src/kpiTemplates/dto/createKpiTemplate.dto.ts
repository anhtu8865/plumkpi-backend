import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
} from 'class-validator';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import Aggregation from '../aggregation.enum';
import Comparison from '../comparison.enum';

export class Measure {
  @IsEnum(Comparison)
  comparison: Comparison;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentOfTarget: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentOfKpi: number;

  @IsNotEmpty({ message: 'Vui lòng chọn màu' })
  @IsString()
  color: string;
}

export class CreateKpiTemplateDto {
  @IsNotEmpty({ message: 'Tên KPI không được để trống' })
  kpi_template_name: string;

  description?: string;

  @IsEnum(Aggregation)
  @IsNotEmpty()
  @IsOptional()
  aggregation?: Aggregation;

  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  unit: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Measure)
  measures?: Measure[];

  @IsNotEmpty({ message: 'Danh mục KPI không được để trống' })
  kpi_category: KpiCategory;
}

export default CreateKpiTemplateDto;
