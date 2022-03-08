import Dept from 'src/departments/dept.entity';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  user_name: string;

  @IsEmail({}, { message: 'Email người dùng không hợp lệ' })
  @IsNotEmpty({ message: 'Email người dùng không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Phòng ban không được để trống' })
  dept: Dept;
}

export default CreateUserDto;
