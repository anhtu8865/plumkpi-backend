import Role from 'src/users/role.enum';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UserParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  user_name?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  role?: Role;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  dept?: number;
}
