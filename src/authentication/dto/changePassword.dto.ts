import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @MinLength(6, { message: 'Password cũ phải dài hơn 6 ký tự' })
  @IsNotEmpty({ message: 'Password cũ không được để trống' })
  oldPassword: string;

  @MinLength(6, { message: 'Password mới phải dài hơn 6 ký tự' })
  @IsNotEmpty({ message: 'Password mới không được để trống' })
  newPassword: string;
}
