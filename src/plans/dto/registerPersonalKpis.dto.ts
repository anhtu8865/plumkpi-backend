import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class PersonalKpiDto {
  @IsNumber()
  kpi_template_id: number;
}

export class RegisterPersonalKpisDto {
  @IsNumber()
  plan_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalKpiDto)
  personal_kpis: PersonalKpiDto[];
}
