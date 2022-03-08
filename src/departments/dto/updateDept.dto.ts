import User from 'src/users/user.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeptDto {
  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  @IsOptional()
  dept_name?: string;

  description?: string;

  @IsNotEmpty()
  @IsOptional()
  manager?: User;
}

export default UpdateDeptDto;
