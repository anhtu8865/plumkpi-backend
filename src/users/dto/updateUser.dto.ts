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
import Gender from '../gender.enum';
import Role from '../role.enum';

export class UpdateUserDto {
  @IsNumber()
  @IsOptional()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  user_name: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsOptional()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: Role;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  is_active: boolean;

  @IsNotEmpty()
  @IsOptional()
  dept: Dept;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  gender: Gender;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  dob: string;

  @IsNotEmpty()
  @IsOptional()
  manage: Dept;
}

export default UpdateUserDto;
