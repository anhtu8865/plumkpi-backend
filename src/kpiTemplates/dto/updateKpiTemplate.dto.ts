import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import Direction from '../direction.enum';
import Frequency from '../frequency.enum';

export class UpdateKpiCategoryDto {
  @IsNumber()
  @IsOptional()
  kpi_template_id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  kpi_template_name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  frequency: Frequency;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  direction: Direction;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  unit: string;

  @IsString()
  @IsOptional()
  formula: string;
}

export default UpdateKpiCategoryDto;
