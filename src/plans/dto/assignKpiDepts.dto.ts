import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class DeptsDto {
  @IsNumber()
  @IsNotEmpty()
  dept_id: number;

  @IsNumber()
  @IsNotEmpty()
  target: number;
}

export class AssignKpiDeptsDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeptsDto)
  depts: DeptsDto[];
}
