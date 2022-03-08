import { IsNumber, Min, IsOptional, IsString, Max } from 'class-validator';
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
  name?: string;
}
