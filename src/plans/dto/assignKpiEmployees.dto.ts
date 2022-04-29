import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class UsersDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}

export class AssignKpiEmployeesDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsersDto)
  users: UsersDto[];
}

export class RegisterPlanForEmployeesDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber({}, { each: true })
  @IsArray()
  user_ids: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiCategoryDto)
  kpi_categories: KpiCategoryDto[];
}

export class KpiCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_category_id: number;

  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KpiTemplateDto)
  kpi_templates: KpiTemplateDto[];
}

export class KpiTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;
}
