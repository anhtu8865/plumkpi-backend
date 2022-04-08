import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

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
