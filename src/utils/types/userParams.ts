import Role from 'src/users/role.enum';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserParams {
  @Type(() => Number)
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  offset: number;

  @Type(() => Number)
  @Min(1)
  @Max(10)
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  user_name: string;

  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: Role;

  @Type(() => Number)
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  dept: number;

  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;
}
