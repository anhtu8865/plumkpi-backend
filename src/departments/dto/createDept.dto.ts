import { IsNotEmpty } from 'class-validator';

export class CreateDeptDto {
  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  dept_name: string;

  description: string;
}

export default CreateDeptDto;
