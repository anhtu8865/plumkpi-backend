import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CrudIdParam {
  @Type(() => Number)
  @IsNumber()
  crud_id: number;
}

export class CrudNameParam {
  @Type(() => String)
  @IsNotEmpty()
  @IsOptional()
  crud_name?: string;
}
