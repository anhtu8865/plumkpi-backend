import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Role from 'src/users/role.enum';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';

import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { Equal, LessThan, LessThanOrEqual, Like, Repository } from 'typeorm';
import { CreateNotifDto, UpdateNotifDto } from './dto/notif.dto';
import { Notif } from './notif.entity';
import Time from './time.entity';

@Injectable()
export default class NotifsService {
  constructor(
    @InjectRepository(Notif)
    private notifsRepository: Repository<Notif>,

    @InjectRepository(Time)
    private timesRepository: Repository<Time>,
  ) {}

  async createNotif(data: CreateNotifDto) {
    const { content, day, month, role } = data;
    if ([4, 6, 9, 11].includes(month) && day === 31)
      throw new CustomBadRequestException(`Ngày nhập không hợp lệ`);
    else if (month === 2 && [29, 30, 31].includes(day))
      throw new CustomBadRequestException(`Ngày nhập không hợp lệ`);
    return this.notifsRepository.save({ content, day, month, role });
  }

  async getNotifById(notif_id: number) {
    const notif = await this.notifsRepository.findOne(notif_id);
    if (notif) {
      return notif;
    }
    throw new CustomNotFoundException(
      `Không tìm thấy thống báo id ${notif_id}`,
    );
  }

  async getNotifs(
    offset: number,
    limit: number,
    content: string,
    day: number,
    month: number,
    role: Role,
  ) {
    const whereCondition = {
      content: Like(`%${content ? content : ''}%`),
      day,
      month,
      role,
    };

    Object.keys(whereCondition).forEach(
      (key) => whereCondition[key] === undefined && delete whereCondition[key],
    );

    const [items, count] = await this.notifsRepository.findAndCount({
      where: [whereCondition],
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async updateNotif(notif_id: number, data: UpdateNotifDto) {
    const notif = await this.getNotifById(notif_id);
    const day = data.day ? data.day : notif.day;
    const month = data.month ? data.month : notif.month;
    if ([4, 6, 9, 11].includes(month) && day === 31)
      throw new CustomBadRequestException(`Ngày nhập không hợp lệ`);
    else if (month === 2 && [29, 30, 31].includes(day))
      throw new CustomBadRequestException(`Ngày nhập không hợp lệ`);
    return this.notifsRepository.save({ ...notif, ...data });
  }

  async deleteNotif(notif_id: number) {
    const notif = await this.getNotifById(notif_id);
    return this.notifsRepository.remove(notif);
  }

  async getNotifsByUser(offset: number, limit: number, role: Role) {
    const { time } = await this.getTime();
    const date = new Date(time);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    const [items, count] = await this.notifsRepository.findAndCount({
      where: [
        {
          role,
          month: LessThan(month),
        },
        {
          role,
          month: Equal(month),
          day: LessThanOrEqual(day),
        },
      ],
      order: { month: 'DESC', day: 'DESC' },
      skip: offset,
      take: limit,
    });
    return { items, count };
  }

  async getSchedulerByUser(role: Role) {
    return this.notifsRepository.find({
      where: {
        role,
      },
      order: { month: 'ASC', day: 'ASC' },
    });
  }

  async getTime() {
    return this.timesRepository.findOne(1);
  }

  async updateTime(time: string) {
    return this.timesRepository.save({ time_id: 1, time });
  }
}
