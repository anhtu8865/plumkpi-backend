import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import { CreateNotifDto } from './dto/notif.dto';
import NotifsService from './notifs.service';
import { NotifIdParam } from './params/notifParams';

@Controller('notifs')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard([Role.Director, Role.Manager, Role.Employee]))
@UseGuards(JwtAuthenticationGuard)
export default class NotifsController {
  constructor(private readonly notifsService: NotifsService) {}

  @Post()
  async createNotif(@Body() data: CreateNotifDto) {
    return this.notifsService.createNotif(data);
  }

  @Get()
  async getNotifs(@Req() request: RequestWithUser) {
    const user = request.user;
    return this.notifsService.getNotifs(user);
  }

  @Put('notif')
  async markedAsRead(@Query() { notif_id }: NotifIdParam) {
    notif_id = Number(notif_id);
    return this.notifsService.markedAsRead(notif_id);
  }
}
