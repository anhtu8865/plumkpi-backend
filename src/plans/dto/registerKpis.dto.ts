import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

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

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpisDto)
  kpis: KpisDto[];
}

export default RegisterKpisDto;
