import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ChartType, DateType } from '../interface/properties.interface';

export class CreateChartDto {
  @IsNumber()
  dashboard_id: number;

  @IsNotEmpty({ message: 'Tên biểu đồ không được để trống' })
  chart_name: string;

  @IsString()
  description: string;

  @IsNumber()
  plan_id: number;

  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  @IsArray()
  kpis: number[];

  @IsEnum(DateType)
  dateType: DateType;

  @IsNumber({}, { each: true })
  @IsArray()
  period: number[];

  @IsNumber({}, { each: true })
  @IsArray()
  filter: number[];

  @IsEnum(ChartType)
  chart_type: ChartType;
}

export class PropertiesDto {
  @IsNotEmpty({ message: 'Tên biểu đồ không được để trống' })
  chart_name: string;

  @IsString()
  description: string;

  @IsNumber()
  plan_id: number;

  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  @IsArray()
  kpis: number[];

  @IsEnum(DateType)
  dateType: DateType;

  @IsNumber({}, { each: true })
  @IsArray()
  period: number[];

  @IsNumber({}, { each: true })
  @IsArray()
  filter: number[];
}
