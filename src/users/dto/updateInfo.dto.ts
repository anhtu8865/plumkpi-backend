import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import Dept from 'src/departments/dept.entity';
import Gender from '../gender.enum';

export class UpdateInfoDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsOptional()
  user_name?: string;

  @IsEmail({}, { message: 'Email người dùng không hợp lệ' })
  @IsNotEmpty({ message: 'Email người dùng không được để trống' })
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Số điện thoại phải là một dãy số' })
  phone?: string;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsOptional()
  gender?: Gender;

  @IsOptional()
  address?: string;

  @IsOptional()
  dob?: string;
}

export default UpdateInfoDto;
