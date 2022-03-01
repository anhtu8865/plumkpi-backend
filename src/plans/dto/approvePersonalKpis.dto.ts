import { IsArray, IsNotEmpty } from 'class-validator';

export class ApprovePersonalKpisDto {
  @IsNotEmpty()
  @IsArray()
  rows;
}

export default ApprovePersonalKpisDto;
