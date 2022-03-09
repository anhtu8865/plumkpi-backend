import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlanDto {
  @IsNotEmpty({ message: 'Tên kế hoạch không được để trống' })
  @IsOptional()
  plan_name: string;

  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Năm kế hoạch không được để trống' })
  @IsOptional()
  year: number;
}

export default UpdatePlanDto;
