import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DateType } from '../interface/properties.interface';

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

  @IsBoolean()
  separated: boolean;
}

export class UpdateChartDto {
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

  @IsBoolean()
  separated: boolean;
}
