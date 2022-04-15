import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import Role from 'src/users/role.enum';

export class CreateNotifDto {
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  content: string;

  @Min(1)
  @Max(31)
  @IsNumber()
  day: number;

  @Min(1)
  @Max(12)
  @IsNumber()
  month: number;

  @IsEnum(Role)
  role: Role;
}

export class UpdateNotifDto {
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsOptional()
  content: string;

  @Min(1)
  @Max(31)
  @IsNumber()
  @IsOptional()
  day: number;

  @Min(1)
  @Max(12)
  @IsNumber()
  @IsOptional()
  month: number;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
