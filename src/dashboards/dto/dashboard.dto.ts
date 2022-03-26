import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDashboardDto {
  @IsNotEmpty({ message: 'Tên dashboard không được để trống' })
  dashboard_name: string;

  description?: string;
}

export class UpdateDashboardDto {
  @IsNotEmpty({ message: 'Tên dashboard không được để trống' })
  @IsOptional()
  dashboard_name?: string;

  description?: string;
}
