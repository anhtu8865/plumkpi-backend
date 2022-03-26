import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateChartDto {
  @IsNumber()
  dashboard_id: number;

  @IsNumber()
  plan_id: number;

  @IsNotEmpty({ message: 'Tên biểu đồ không được để trống' })
  chart_name: string;

  description?: string;
}

export class UpdateChartDto {
  @IsNotEmpty({ message: 'Tên biểu đồ không được để trống' })
  @IsOptional()
  chart_name?: string;

  description?: string;
}
