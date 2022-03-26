import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class DashboardIdParam {
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  dashboard_id: number;
}

export class DashboardNameParam {
  @Type(() => String)
  @IsNotEmpty()
  @IsOptional()
  dashboard_name?: string;
}
