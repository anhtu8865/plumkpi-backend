import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class DeptParam {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  dept_id: number;
}

export class UserParam {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  user_id: number;
}
