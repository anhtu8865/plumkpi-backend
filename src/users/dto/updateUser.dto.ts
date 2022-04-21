import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import Dept from 'src/departments/dept.entity';

export class UpdateUserDto {
  // @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  // @IsOptional()
  // user_name?: string;

  // @IsEmail({}, { message: 'Email người dùng không hợp lệ' })
  // @IsNotEmpty({ message: 'Email người dùng không được để trống' })
  // @IsOptional()
  // email?: string;

  // @IsNotEmpty({ message: 'Phòng ban không được để trống' })
  // @IsOptional()
  // dept?: Dept;

  @MinLength(6, { message: 'Password người dùng phải dài hơn 6 ký tự' })
  @IsNotEmpty({ message: 'Password người dùng không được để trống' })
  @IsOptional()
  password?: string;

  @IsBoolean({ message: 'Trường is active phải thuộc kiểu boolean' })
  @IsNotEmpty({ message: 'Trường is active không được để trống' })
  @IsOptional()
  is_active?: boolean;
}

export default UpdateUserDto;
