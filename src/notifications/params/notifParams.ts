import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class NotifIdParam {
  @Type(() => Number)
  @Min(1)
  @IsNumber()
  notif_id: number;
}
