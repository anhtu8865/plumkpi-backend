import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
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
  @IsOptional()
  is_active: boolean;
}

export default UpdateUserDto;
