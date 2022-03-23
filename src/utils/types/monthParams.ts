import { IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class monthParams {
  @Type(() => Number)
  @Min(1)
  @Max(12)
  @IsNumber()
  month: number;
}

export class quarterParams {
  @Type(() => Number)
  @Min(1)
  @Max(4)
  @IsNumber()
  quarter: number;
}
