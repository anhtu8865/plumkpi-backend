import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import Direction from '../direction.enum';
import Frequency from '../frequency.enum';

export class CreateKpiTemplateDto {
  @IsString()
  @IsNotEmpty()
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
  unit: string;

  @IsString()
  @IsOptional()
  formula: string;
}

export default CreateKpiTemplateDto;
