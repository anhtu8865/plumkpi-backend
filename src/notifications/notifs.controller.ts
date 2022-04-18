import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
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
import {
  NotifPaginationParams,
  OptionalPaginationParams,
  PaginationParams,
} from 'src/utils/types/paginationParams';
import { CreateNotifDto, UpdateNotifDto } from './dto/notif.dto';
import NotifsService from './notifs.service';
import { NotifIdParam } from './params/notifParams';

@Controller('notifs')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class NotifsController {
  constructor(private readonly notifsService: NotifsService) {}

  @UseGuards(RoleGuard([Role.Admin]))
  @Post()
  async createNotif(@Body() data: CreateNotifDto) {
    return this.notifsService.createNotif(data);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Get()
  async getNotifs(
    @Query()
    { offset, limit, content, day, month, role }: NotifPaginationParams,
  ) {
    return this.notifsService.getNotifs(
      offset,
      limit,
      content,
      day,
      month,
      role,
    );
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Put('notif')
  async updateNotif(
    @Query() { notif_id }: NotifIdParam,
    @Body() data: UpdateNotifDto,
  ) {
    notif_id = Number(notif_id);
    return this.notifsService.updateNotif(notif_id, data);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete('notif')
  async deleteNotif(@Query() { notif_id }: NotifIdParam) {
    notif_id = Number(notif_id);
    return this.notifsService.deleteNotif(notif_id);
  }

  @Get('time')
  async getTime() {
    return this.notifsService.getTime();
  }

  @Put('time')
  async updateTime(@Body() { time }) {
    return this.notifsService.updateTime(time);
  }

  @UseGuards(RoleGuard([Role.Director, Role.Manager, Role.Employee]))
  @Get('user')
  async getNotifsByUser(
    @Query()
    { offset, limit }: OptionalPaginationParams,
    @Req() request: RequestWithUser,
  ) {
    const role = request.user.role;
    return this.notifsService.getNotifsByUser(offset, limit, role);
  }
}
