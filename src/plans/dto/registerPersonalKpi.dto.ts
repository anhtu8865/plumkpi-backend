import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export default class RegisterPersonalKpiDto {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  target: number;
}
