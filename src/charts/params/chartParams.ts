import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class ChartParam {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  chart_id: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  dashboard_id: number;
}

export class DashboardParam {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  dashboard_id: number;
}
