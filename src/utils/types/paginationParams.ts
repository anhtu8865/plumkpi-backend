import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
  Max,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import Role from 'src/users/role.enum';

export class PaginationParams {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  limit: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  name?: string;
}

export class GetPersonalKpisParams extends PaginationParams {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plan_id: number;
}

export class NotifPaginationParams {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  limit: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  content?: string;

  @Min(1)
  @Max(31)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  day: number;

  @Min(1)
  @Max(12)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  month: number;

  @IsEnum(Role)
  @IsOptional()
  @Type(() => String)
  role: Role;
}
