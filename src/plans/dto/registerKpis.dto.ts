import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class KpisDto {
  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
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
  @Type(() => KpisDto)
  kpis: KpisDto[];
}

export default RegisterKpisDto;
