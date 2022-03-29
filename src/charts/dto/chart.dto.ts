import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChartType, ViewType } from '../interface/properties.interface';

export class FilterDto {
  @IsNumber()
  @Min(1)
  dept_id: number;

  @IsNumber({}, { each: true })
  @IsArray()
  user_ids: number[];
}

export class PropertiesDto {
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  @IsArray()
  kpis: number[];

  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  @ArrayNotEmpty()
  @IsArray()
  months: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters: FilterDto[];

  @IsEnum(ViewType)
  view: ViewType;

  @IsEnum(ChartType)
  chartType: ChartType;
}

export class CreateChartDto {
  @IsNumber()
  dashboard_id: number;

  @IsNumber()
  plan_id: number;

  @IsNotEmpty({ message: 'Tên biểu đồ không được để trống' })
  chart_name: string;

  description?: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PropertiesDto)
  properties: PropertiesDto;
}

export class UpdateChartDto {
  @IsNotEmpty({ message: 'Tên biểu đồ không được để trống' })
  @IsOptional()
  chart_name?: string;

  description?: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PropertiesDto)
  @IsOptional()
  properties?: PropertiesDto;
}
