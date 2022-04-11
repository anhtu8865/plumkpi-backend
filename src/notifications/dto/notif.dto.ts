import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateNotifDto {
  @IsNotEmpty({ message: 'Chủ đề không được để trống' })
  title: string;

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  content: string;

  @IsNotEmpty({ message: 'Thời gian không được để trống' })
  time: string;

  @IsNumber()
  user_id: number;
}
