import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TargetUsersDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  @IsOptional()
  target?: number;
}

export class RegisterMonthlyTargetDto {
  @IsNumber()
  plan_id: number;

  @IsNumber()
  kpi_template_id: number;

  @IsNumber()
  target: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetUsersDto)
  users: TargetUsersDto[];
}
