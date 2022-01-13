import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeptDto {
  @IsString()
  @IsNotEmpty()
  dept_name: string;
}

export default CreateDeptDto;
