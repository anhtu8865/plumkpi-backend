import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddKpiCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;
}

export default AddKpiCategoryDto;
