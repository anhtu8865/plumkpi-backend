import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCrudDto {
  @IsNotEmpty({ message: 'Tên crud không được để trống' })
  crud_name: string;

  description?: string;
}

export class UpdateCrudDto {
  @IsNotEmpty({ message: 'Tên crud không được để trống' })
  @IsOptional()
  crud_name?: string;

  description?: string;
}
