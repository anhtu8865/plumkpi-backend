import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class Children {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @IsOptional()
  target: number;
}

export class AssignKpi {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  parent_plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  kpi_template_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  parent_target: number;

  @IsNotEmpty()
  @IsArray()
  children: Children[];
}

export default AssignKpi;
