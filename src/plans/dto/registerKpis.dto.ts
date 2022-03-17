import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class KpiDto {
  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
}

export class KpisDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiDto)
  kpi_templates: KpiDto[];
}

export class RegisterKpisDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_category_id: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiDto)
  kpis: KpiDto[];
}

export default RegisterKpisDto;
