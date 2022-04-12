import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notif } from './notif.entity';
import NotifsController from './notifs.controller';
import NotifsService from './notifs.service';
import Time from './time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notif, Time])],
  controllers: [NotifsController],
  providers: [NotifsService],
})
export class NotifsModule {}
