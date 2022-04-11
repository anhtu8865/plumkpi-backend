import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notif } from './notif.entity';
import NotifsController from './notifs.controller';
import NotifsService from './notifs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notif])],
  controllers: [NotifsController],
  providers: [NotifsService],
})
export class NotifsModule {}
