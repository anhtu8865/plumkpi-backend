import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeptDto {
  @IsNumber()
  @IsOptional()
  dept_id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  dept_name: string;
}

export default UpdateDeptDto;
