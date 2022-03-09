import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty({ message: 'Tên kế hoạch không được để trống' })
  plan_name: string;

  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Năm kế hoạch không được để trống' })
  year: number;
}

export default CreatePlanDto;
