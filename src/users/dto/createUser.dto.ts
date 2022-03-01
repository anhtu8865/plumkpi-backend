import Dept from 'src/departments/dept.entity';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import Role from '../role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  role: Role;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @IsNotEmpty()
  @IsOptional()
  dept: Dept;

  @IsNotEmpty()
  @IsOptional()
  manage: Dept;
}

export default CreateUserDto;
